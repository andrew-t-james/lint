import arg from "arg";
import inquirer from "inquirer";
import { createProject } from "./main";

function parseArgsIntoOptions(rawArgs) {
  const flags = {
    "--git": Boolean,
    "--install": Boolean,
    "--yes": Boolean,
    "-g": "--git",
    "-i": "--install",
    "-y": "--yes"
  };
  const args = arg(flags, {
    argv: rawArgs.slice(2)
  });

  const directory = args._[0]
    ? args._.slice(0)
        .map(s => s.toLowerCase())
        .join("-")
    : ".";

  return {
    skipPrompts: args["--yes"] || false,
    git: args["--git"] || false,
    directory,
    runInstall: args["--install"] || false
  };
}

async function optionsPrompts(options) {
  const defaultTemplate = "javascript";
  if (options.skipPrompts) {
    return {
      ...options,
      template: options.template || defaultTemplate
    };
  }

  const questions = [];

  if (!options.template) {
    questions.push({
      type: "list",
      name: "template",
      message: "Choose a template.",
      choices: ["javascript", "typescript"],
      default: defaultTemplate
    });
  }

  if (!options.git) {
    questions.push({
      type: "confirm",
      name: "git",
      message: "Should a git be initialized?",
      default: false
    });
  }

  const answers = await inquirer.prompt(questions);

  return {
    ...options,
    template: options.template || answers.template,
    git: options.git || answers.git
  };
}

export async function cli(args) {
  let options = parseArgsIntoOptions(args);
  options = await optionsPrompts(options);
  await createProject(options);
}
