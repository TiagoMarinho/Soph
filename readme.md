# Soph #
## A discord bot for generating art with artificial intelligence ##

Soph can generate art from a text prompt - and from another image if the user so desires - by using Stable Diffusion AI.

## How to use: ##

`/dream prompt: 1girl, solo, blonde hair, twintails, blue eyes, blue dress`

Will generate images* such as:

![](https://i.imgur.com/gqu5jHc.png)
<sup>* Provided WebUI is running the correct model</sup>

## Features ##

- Slash commands and rich embeds
- Immediate previews for completed images
- Navigation buttons for mobile devices
- Allows user to change most parameters available in WebUI
	- Negative prompt
	- Sampler
	- Number of steps
	- Classifier Free Guidance Scale
	- Seed
	- Width and height
	- Variation seed and strength
	- Highres-fix
- Support for img2img
- `{prompt1 | prompt2 | prompt3}` syntax allows to change parts of the prompt for each image in a batch
- Upscaling with `/upscale` command
- Retrieves image generation parameters from generated images with `/metadata` command
- Can guess which tags best describe an image through the `/interrogate` command

## About ##

Soph prioritizes UX and being a first-class Discord citizen, and as such uses slash commands and rich embeds with proper multiple image support rather than baking all results into a single image grid, sending each result as a separate image attachment or only displaying one image at a time.

Individual images are sent as soon as they're ready rather than only sending the entire batch at once or showing multiple unfinished images at the same time, that way we can ensure the user gets useful and immediate feedback of their generation request.

![animated GIF of Soph's response to a command](https://i.imgur.com/cc5NohO.gif)

Soph works by requesting images to AUTOMATIC1111's webui API for Stable Diffusion.

## Planned ##

- Support for multiple servers to contribute compute power generating images
- Button for interrupting current batch
- Button for generating more images using the same parameters
- Better support for localization

## Contributing ##

We're actively looking for contributions! Here's a basic overview of the project structure:

> `src/main.js` is the entry point

> Commands are folders in `src/commands/<category>/`

> `src/commands/<category>/<command name>/data.json` stores the command name, description and arguments

> `src/commands/<category>/<command name>/execute.js` contains the code that runs when the user executes said command