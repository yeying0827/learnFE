import { createRenderer } from "@vue/runtime-core";
import * as THREE from 'three';
import { nextTick } from "@vue/runtime-core";

let renderer;

function draw(obj) {
    const {camera, cameraPos, scene, geometry, geometryArg, material, mesh, meshY, meshX} = obj;
    if ([camera, cameraPos, scene, geometry, geometryArg, material, mesh, meshY, meshX].filter(v => v).length < 9) {
        return;
    }
    let cameraObj = new THREE[camera](40, window.innerWidth / window.innerHeight, 0.1, 10);
    Object.assign(cameraObj.position, cameraPos);

    let sceneObj = new THREE[scene]();

    let geometryObj = new THREE[geometry](...geometryArg);

    let materialObj = new THREE[material]();

    let meshObj = new THREE[mesh](geometryObj, materialObj);
    meshObj.rotation.x = meshX;
    meshObj.rotation.y = meshY;

    sceneObj.add(meshObj);

    renderer.render(sceneObj, cameraObj);
}

const {createApp: originCa} = createRenderer({
    insert: (child, parent, anchor) => {
        if (parent.domElement) {
            draw(child);
        }
    },
    createElement(type, isSVG, isCustom) {
        return {
            type
        };
    },
    setElementText(node, text) {
    },
    patchProp(el, key, prevValue, nextValue) {
        el[key] = nextValue;
        draw(el);
    },
    parentNode: node => node,
    nextSibling: node => node,
    createText: text => text,
    remove: node => node
});

function createApp(...args) {
    const app = originCa(...args);
    return {
        mount(selector) {
            renderer = new THREE.WebGLRenderer({ antialias: true });
            renderer.setSize(window.innerWidth, window.innerHeight);
            document.querySelector('#app').appendChild(renderer.domElement);
            app.mount(renderer);
        }
    }
}

export {
    createApp
};
