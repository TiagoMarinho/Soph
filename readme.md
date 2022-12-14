<h1 align="center"><img src="https://i.imgur.com/Rty8HhE.png" width="128"><br/>Soph</h1>
<p align="center">A discord bot for generating art with artificial intelligence</p>

## Table of Contents

1. [How to use](#how-to-use)
2. [Features](#features)
3. [About](#more-about-soph)
3. [Commands](#commands)
3. [Installation](#installation)
4. [Running](#running)
5. [Contributing](#contributing)

## How to use

`/dream prompt: 1girl, solo, blonde hair, twintails, blue eyes, blue dress`

Will yield images such as:

![Four AI-generated anime drawings of a blonde girl with blue eyes wearing a blue dress](https://i.imgur.com/gqu5jHc.png)
<sup>results will vary depending on the stable diffusion model being used</sup>

## Features

- Slash commands and rich embeds
- Immediate previews for completed images
- Navigation buttons for mobile devices
- Buttons for generating more images and modifying prompts from previous generations
- Allows user to change most parameters available in WebUI
	- Negative prompt
	- Sampler
	- Number of steps
	- Classifier-free guidance scale
	- Seed
	- Width and height
	- Variation seed and strength
	- Highres-fix
- Support for img2img
- `{prompt1 | prompt2 | prompt3}` syntax allows to change parts of the prompt for each image in a batch
- Upscaling with `/upscale` command
- Retrieves image generation parameters from generated images with `/metadata` command
- Can guess which tags best describe an image through the `/interrogate` command

## More about Soph

Soph prioritizes UX and being a first-class Discord citizen, and as such uses slash commands and rich embeds with proper multiple image support rather than baking all results into a single image grid, sending each result as a separate image attachment or only displaying one image at a time.

Individual images are sent as soon as they're ready rather than only sending the entire batch at once or showing multiple unfinished images at the same time, that way we can ensure the user gets useful and immediate feedback of their generation request.

![animated GIF of Soph's response to a command](https://i.imgur.com/cc5NohO.gif)

## Commands

* `/dream <prompt>`
	* Also accepts the following optional arguments: `<negative> <batch> <sampler> <steps> <width> <height> <cfg> <highres-fix> <hr-scale> <image> <denoising> <scale-latent>`
* `/metadata <image>`
* `/interrogate <image> <model>`
* `/upscale <image>` 
	* Also accepts the following optional arguments: `<model> <resize> <secondary-model> <mix>`
* `/help`
* `/ping`

## Installation

1. Install https://github.com/AUTOMATIC1111/stable-diffusion-webui and its dependencies
2. Add `--api` to WebUI's [commandline arguments](https://github.com/AUTOMATIC1111/stable-diffusion-webui/wiki/Command-Line-Arguments-and-Settings)
3. Install NodeJS
4. Run `git clone https://github.com/TiagoMarinho/Soph` to clone Soph's repo
5. Create a new Discord application in the [Discord Developer Portal](https://discord.com/developers/applications)
6. Copy the token and client id of your new discord application and put it in `Soph/config.json`, like this:

	```json
	{
		"token": "TOKEN HERE",
		"clientId": "CLIENT ID HERE",
		"cacheChannelId": "SEE NEXT STEP"
	}
	```
7. Add a channel ID in the above `config.json` file for a chat your application has access to, so that it can use as a cache for the images. Every image generated with the bot will be sent in this chat first.
8. Create a file `Soph/src/artificial intelligence/serverlist.json` and add the address of your WebUI to it (usually `127.0.0.1:7860`), like this:
	```json
	[{
		"address": "http://127.0.0.1:7860",
		"credentials": "login:password"
	}]
	```
9. Run `node src/deploy-commands.js` inside Soph's root folder to register the slash commands for the bot.

## Running

1. Launch WebUI and wait for it to finish loading
2. Run `node .` inside Soph's root folder to launch Soph

# Contributing

Contributions, even in the form of creating new issues, are more than welcome! 

Here's a basic overview of the project structure for new contributors to get used to the code base:

* `src/main.js` is the entry point
* Commands are folders in `src/commands/<category>/`
* `src/commands/<category>/<command name>/data.json` stores the command name, description and arguments
* `src/commands/<category>/<command name>/execute.js` contains the code that runs when the user executes said command
