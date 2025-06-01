import { NextRequest, NextResponse } from "next/server";
import * as fs from "fs/promises";
import * as path from "path";
import { exec } from "child_process";
import * as util from "util";
import * as dotenv from "dotenv";

dotenv.config();

const execPromise = util.promisify(exec);

export async function POST(req: NextRequest) {
  const { clonedData, apiKey, provider } = await req.json();
  
  if (!clonedData || !clonedData.html) {
    return NextResponse.json({ error: "No cloned data provided" }, { status: 400 });
  }
  
  const repo = "vortex-gpt-ultimate-pro";
  const repoOwner = process.env.GITHUB_USERNAME || "Minarulvortexvi";
  const repoDir = path.join(process.cwd(), "temp_deploy", repo);
  const deployKeyPath = "/home/user/.ssh/repo_deploy_key";
  const sshConfig = `
    Host github-repo
      HostName github.com
      User git
      IdentityFile ${deployKeyPath}
  `;
  
  try {
    await fs.chmod("/home/user/.ssh", 0o700);
    await fs.chmod(deployKeyPath, 0o600);
    
    const sshConfigPath = path.join(process.cwd(), "temp_ssh_config");
    await fs.writeFile(sshConfigPath, sshConfig);
    process.env.GIT_SSH_COMMAND = `ssh -F ${sshConfigPath}`;
    
    await execPromise("eval $(ssh-agent -s)");
    await execPromise(`ssh-add ${deployKeyPath}`);
    
    await fs.mkdir(path.join(process.cwd(), "temp_deploy"), { recursive: true });
    
    await execPromise(`rm -rf ${repoDir} && git clone git@github.com:${repoOwner}/${repo}.git ${repoDir}`);
    
    await fs.writeFile(path.join(repoDir, "index.html"), clonedData.html);
    
    await execPromise(`cd ${repoDir} && git add . && git commit -m "Deploy cloned website at ${new Date().toISOString()}"`);
    await execPromise(`cd ${repoDir} && git push origin main`);
    
    await execPromise("ssh-agent -k");
    await fs.unlink(sshConfigPath);
    
    return NextResponse.json({ liveUrl: `https://${repoOwner}.github.io/${repo}/` });
  } catch (error) {
    console.error("Deploy error:", error);
    await execPromise("ssh-agent -k").catch(() => {});
    await fs.unlink(sshConfigPath).catch(() => {});
    return NextResponse.json({ error: "Failed to deploy: " + (error as Error).message }, { status: 500 });
  }
}