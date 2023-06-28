<h1 align="center"><img src="https://i.imgur.com/5Fxwmfv.png" width="128"><br/>Soph</h1>
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

Here are some examples of possible images generated using the bot:

![Four AI-generated images, each in a different style](https://i.imgur.com/ywBp1O0.jpg)

## Features

- Slash commands and rich embeds
- Immediate previews for completed images
- Navigation buttons for mobile devices
- Buttons for generating more images, modifying prompts from previous generations and enhancing images
- Allows user to change most parameters available in WebUI
	- Negative prompt
	- Model
	- Sampler
	- Number of steps
	- Classifier-free guidance scale
	- Seed
	- Width and height
	- Variation seed and strength
	- Highres-fix scale and method
- Support for img2img
- `{prompt1 | prompt2 | prompt3}` syntax allows to change parts of the prompt for each image in a batch
- Upscaling with `/upscale` command
- Retrieves image generation parameters from generated images with `/metadata` command
- Can guess which tags best describe an image through the `/interrogate` command

## More about Soph

Soph works by communicating with [Stable Diffusion WebUI](https://github.com/AUTOMATIC1111/stable-diffusion-webui) API to generate images using artificial intelligence. This can be achieved by running WebUI locally on the same machine, on the same network or over the internet.

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
8. Install dependencies by running `npm install` inside Soph's root folder
9. Run `npm run deploy` inside Soph's root folder to register slash commands for the bot.

## Running

1. Launch WebUI and wait for it to finish loading
2. Run `node .` inside Soph's root folder to launch Soph

# Contributing

Contributions, even in the form of creating new issues, are more than welcome! 

Here's a basic overview of the project structure for new contributors to get used to the code base:

* `src/main.js` is the entry point
* Commands are folders in `src/commands/<category>/`
* `src/commands/<category>/<command name>/main.js` contains the code that runs when the user executes said command
