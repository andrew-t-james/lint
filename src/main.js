import chalk from "chalk";
import execa from "execa";
import fs from "fs";
import gitignore from "gitignore";
import Listr from "listr";
import ncp from "ncp";
import path from "path";
import { install } from "pkg-install";
import { promisify } from "util";

const access = promisify(fs.access);
// const writeFile = promisify(fs.writeFile);
const copy = promisify(ncp);
const writeGitignore = promisify(gitignore.writeFile);

async function copyTemplateFiles(options) {
  return copy(options.templateDirectory, options.targetDirectory, {
    clobber: false
  });
}

async function createGitignore(options) {
  const file = fs.createWriteStream(
    path.join(options.targetDirectory, ".gitignore"),
    { flags: "a" }
  );
  return writeGitignore({
    type: "Node",
    file
  });
}

async function initGit(options) {
  const result = await execa("git", ["init"], {
    cwd: options.targetDirectory
  });
  if (result.failed) {
    return Promise.reject(new Error("Failed to initialize git"));
  }
  return;
}

async function commitAndAdd(options) {
  const add = await execa("git", ["add", "."], {
    cwd: options.targetDirectory
  });
  if (add.failed) {
    return Promise.reject(new Error("Failed to initialize git"));
  }
  const commit = await execa("git", ["commit", "-m", "Init commit"], {
    cwd: options.targetDirectory
  });

  if (commit.failed) {
    return Promise.reject(new Error("Failed to initialize git"));
  }
  return;
}

export async function createProject(options) {
  options = {
    ...options,
    targetDirectory: options.targetDirectory || process.cwd(),
    email: "",
    name: ""
  };

  const templateDir = path.resolve(
    new URL(import.meta.url).pathname,
    "../../templates",
    options.template
  );
  options.templateDirectory = templateDir;

  try {
    await access(templateDir, fs.constants.R_OK);
  } catch (err) {
    console.error("%s Invalid template name", chalk.red.bold("ERROR"));
    process.exit(1);
  }

  const tasks = new Listr(
    [
      {
        title: "Copying project files",
        task: () => copyTemplateFiles(options)
      },
      {
        title: "Creating git ignore file",
        task: () => createGitignore(options)
      },
      {
        title: "Installing dependencies",
        task: async () => {
          const basePackages = {
            eslint: "*",
            "eslint-config-prettier": "*",
            "eslint-plugin-prettier": "*",
            prettier: "*"
          };
          const jsPackages = {
            ...basePackages,
            "babel-eslint": "*",
            "babel-loader": "*"
          };
          const tsPackages = {
            ...basePackages,
            "@typescript-eslint/eslint-plugin": "*",
            "@typescript-eslint/parser": "*",
            typescript: "*"
          };
          const packages =
            options.template === "javascript" ? jsPackages : tsPackages;
          const installOptions = { dev: true, prefer: "npm" };

          await install(packages, installOptions);
        }
      },
      {
        title: "Initializing git",
        task: () => initGit(options),
        enabled: () => options.git
      },
      {
        title: "Committing files to git",
        task: () => commitAndAdd(options),
        enabled: () => options.git
      }
    ],
    {
      exitOnError: true
    }
  );

  await tasks.run();
  console.log(
    "\n%s setting up your lazy lint project\n",
    chalk.green.bold("DONE")
  );
  return true;
}
