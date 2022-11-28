import { defs, tiny } from '../tiny-graphics-stuff/common.js';

const {
    Vector, Vector3, vec, vec3, vec4, color, hex_color, Shader, Matrix, Mat4, Light, Shape, Material, Scene, Texture,
} = tiny;

const {Cube, Axis_Arrows, Textured_Phong} = defs;

export class Texture_Road extends Textured_Phong {
        // TODO:  Modify the shader below (right now it's just the same fragment shader as Textured_Phong) for requirement #6.
        fragment_glsl_code() {
            return this.shared_glsl_code() + `
                varying vec2 f_tex_coord; //pre-interpolated texture coordinates
                uniform sampler2D texture;
                uniform float animation_time;
                
                void main(){
                    // Sample the texture image in the correct place:
                    //translate, reset every 2 units (1 cube)
                    float slide = mod(animation_time,2.0)*2.0;
                
                    vec4 new_coord = vec4(f_tex_coord, 0., 1.);
                    vec4 tex_color = texture2D( texture, new_coord.xy);
                    
                    //strips
                    //each road block = 10x10 
                    //texture map 4x4???????

                    float x = mod(new_coord.x, 4.0);
                    float y = mod(new_coord.y, 2.0); //make strip repeat

                    //  strip
                    //width = 0.2, length = 0.75, space between  = 1.25
                    if (x > 1.9 && x <2.1 && (y > 0.0 && y < 0.75)){
                        tex_color = vec4(1,1,1,1);
                    }
                    
                    //side strips
                    if ((x > 0.075 && x<0.16) ||  (x < 3.925 && x > 3.84) && (y > 0.0 && y < 2.0)){
                        tex_color = vec4(1,1,1,1);
                    }
    
                
                    if( tex_color.w < .01 ) discard;
                                                                             // Compute an initial (ambient) color:
                    gl_FragColor = vec4( ( tex_color.xyz + shape_color.xyz ) * ambient, shape_color.w * tex_color.w ); 
                                                                             // Compute the final color with contributions from lights:
                    gl_FragColor.xyz += phong_model_lights( normalize( N ), vertex_worldspace );
            } `;
        }
    }

    export class Texture_Curve extends Textured_Phong {
        // TODO:  Modify the shader below (right now it's just the same fragment shader as Textured_Phong) for requirement #6.
        fragment_glsl_code() {
            return this.shared_glsl_code() + `
                varying vec2 f_tex_coord; //pre-interpolated texture coordinates
                uniform sampler2D texture;
                uniform float animation_time;
                
                void main(){
                    // Sample the texture image in the correct place:
                    //translate, reset every 2 units (1 cube)
                    float slide = mod(animation_time,2.0)*2.0;
                
                    vec4 new_coord = vec4(f_tex_coord, 0., 1.);
                    vec4 tex_color = texture2D( texture, new_coord.xy);
                    
                    //strips
                    //each curve width = 50
                    //curve partitions = 50 (on x and y)
                    //texture map 4x4???????
                    
                    float x = mod(new_coord.x, 12.5);
                    float y = mod(new_coord.y, 50.0); //make strip repeat twice in y direction

                    //  strip
                    if (x > 5.5 && x <9.5 && (y > 23.7 && y < 26.25)){
                        tex_color = vec4(1,1,1,1);
                    }

                    //side strips
                    if (x > 0.0 && x<12.5 && (y > 1.0 && y < 2.0) || (y > 48.0 && y < 49.0)){
                        tex_color = vec4(1,1,1,1);
                    }

                
                    if( tex_color.w < .01 ) discard;
                                                                             // Compute an initial (ambient) color:
                    gl_FragColor = vec4( ( tex_color.xyz + shape_color.xyz ) * ambient, shape_color.w * tex_color.w ); 
                                                                             // Compute the final color with contributions from lights:
                    gl_FragColor.xyz += phong_model_lights( normalize( N ), vertex_worldspace );
            } `;
        }
    }
    