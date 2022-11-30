import { defs, tiny } from '../tiny-graphics-stuff/common.js';

import { Transforms_Sandbox } from '../tiny-graphics-stuff/transforms-sandbox.js';

// Pull these names into this module's scope for convenience:
const {
	Vector,
	Vector3,
	vec,
	vec3,
	vec4,
	color,
	Matrix,
	Mat4,
	Light,
	Shape,
	Material,
	Shader,
	Texture,
	Scene,
	Canvas_Widget,
	Code_Widget,
	Text_Widget,
} = tiny;

const { Textured_Phong } = defs;

// Now we have loaded everything in the files tiny-graphics.js, tiny-graphics-widgets.js, and common.js.
// This yielded "tiny", an object wrapping the stuff in the first two files, and "defs" for wrapping all the rest.

// ******************** Extra step only for when executing on a local machine:
//                      Load any more files in your directory and copy them into "defs."
//                      (On the web, a server should instead just pack all these as well
//                      as common.js into one file for you, such as "dependencies.js")
const urlParams = new URLSearchParams(window.location.search);
const map_number = urlParams.get('map_number')
	? urlParams.get('map_number')
	: 1;

let timeLeft = 180;

const { GameMap } = await import('./map' + map_number + '.js');

const Minimal_Webgl_Demo = defs.Minimal_Webgl_Demo;

Object.assign(defs, { Transforms_Sandbox }, { GameMap });

// ******************** End extra step

// (Can define Main_Scene's class here)

const Main_Scene = GameMap;
const Additional_Scenes = [];

export {
	Main_Scene,
	Additional_Scenes,
	Canvas_Widget,
	Code_Widget,
	Text_Widget,
	defs,
};
