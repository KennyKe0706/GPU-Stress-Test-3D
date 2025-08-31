let scene, camera, renderer, objects = [];
let particleCount = 1000;
let lightCount = 3;
let complexity = 2;
let frameCount = 0;
let lastUpdateTime = 0;
let updateInterval = 500; // update FPS every 500ms

const stats = new Stats();
stats.showPanel(0); 
stats.dom.style.left = '20px';
stats.dom.style.top = '20px';
document.body.appendChild(stats.dom);

// Initialize scene
function init() {
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x111111);

    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 2000);
    camera.position.set(0,50,200);

    renderer = new THREE.WebGLRenderer({antialias: true});
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    document.body.appendChild(renderer.domElement);

    const ambientLight = new THREE.AmbientLight(0x404040);
    scene.add(ambientLight);

    createObjects(particleCount);
    createLights(lightCount);

    window.addEventListener('resize', onWindowResize);

    document.getElementById('loading').style.display = 'none';
    lastUpdateTime = performance.now();
}

// Create objects
function createObjects(count) {
    objects.forEach(obj => scene.remove(obj));
    objects = [];

    const segments = complexity * 8;
    const geometryTypes = [
        new THREE.BoxGeometry(2,2,2,segments,segments,segments),
        new THREE.SphereGeometry(1, segments*2, segments*2),
        new THREE.TorusGeometry(1,0.4,segments,segments*2),
        new THREE.ConeGeometry(1,2,segments*2),
        new THREE.CylinderGeometry(0.8,0.8,2,segments*2)
    ];

    for(let i=0;i<count;i++){
        const geom = geometryTypes[Math.floor(Math.random()*geometryTypes.length)];
        const material = new THREE.MeshStandardMaterial({
            color: Math.random()*0xffffff,
            roughness:0.7,
            metalness:0.3,
            emissive: new THREE.Color(Math.random()*0x333333)
        });
        const mesh = new THREE.Mesh(geom,material);
        mesh.position.set((Math.random()-0.5)*400,(Math.random()-0.5)*200,(Math.random()-0.5)*400);
        mesh.rotation.set(Math.random()*Math.PI,Math.random()*Math.PI,Math.random()*Math.PI);
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        mesh.userData = { speed: { x:(Math.random()-0.5)*0.02, y:(Math.random()-0.5)*0.02, z:(Math.random()-0.5)*0.02 } };
        scene.add(mesh);
        objects.push(mesh);
    }

    document.getElementById('objectCounter').textContent = objects.length.toLocaleString();
}

// Create lights
let lights = [];
function createLights(count){
    lights.forEach(l=>scene.remove(l));
    lights=[];
    for(let i=0;i<count;i++){
        const light = new THREE.PointLight(new THREE.Color(Math.random()*0xffffff),1.0,200);
        light.position.set((Math.random()-0.5)*300,Math.random()*100+50,(Math.random()-0.5)*300);
        light.castShadow = true;
        light.shadow.mapSize.width = 1024;
        light.shadow.mapSize.height = 1024;
        scene.add(light);
        lights.push(light);
    }
}

// Window resize
function onWindowResize(){
    camera.aspect = window.innerWidth/window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

// Animation loop
function animate(){
    stats.begin();
    requestAnimationFrame(animate);

    const time = performance.now()*0.001;

    objects.forEach(obj=>{
        obj.rotation.x += obj.userData.speed.x;
        obj.rotation.y += obj.userData.speed.y;
        obj.rotation.z += obj.userData.speed.z;
        obj.position.x += Math.sin(time + obj.position.z*0.01)*0.1;
        obj.position.y += Math.cos(time + obj.position.x*0.01)*0.1;
        if(Math.abs(obj.position.x)>200) obj.userData.speed.x*=-1;
        if(Math.abs(obj.position.y)>100) obj.userData.speed.y*=-1;
        if(Math.abs(obj.position.z)>200) obj.userData.speed.z*=-1;
    });

    lights.forEach(light=>{
        light.position.x = Math.sin(time*0.7)*100;
        light.position.z = Math.cos(time*0.5)*100;
        light.position.y = Math.sin(time*0.3)*50+70;
    });

    camera.position.x = Math.sin(time*0.2)*50;
    camera.position.z = 200 + Math.cos(time*0.1)*20;
    camera.lookAt(0,0,0);

    renderer.render(scene,camera);
    stats.end();

    frameCount++;
    const currentTime = performance.now();
    if(currentTime-lastUpdateTime>=updateInterval){
        const fps = Math.round((frameCount*1000)/(currentTime-lastUpdateTime));
        document.getElementById('fpsCounter').textContent=fps;
        frameCount=0;
        lastUpdateTime=currentTime;
    }
}

// Initialize UI sliders
function initUI(){
    const countSlider = document.getElementById("countSlider");
    const countLabel = document.getElementById("countLabel");
    countSlider.addEventListener("input",()=>{
        particleCount=parseInt(countSlider.value);
        countLabel.textContent=particleCount.toLocaleString();
        createObjects(particleCount);
    });

    const lightSlider = document.getElementById("lightSlider");
    const lightLabel = document.getElementById("lightLabel");
    lightSlider.addEventListener("input",()=>{
        lightCount=parseInt(lightSlider.value);
        lightLabel.textContent=lightCount;
        createLights(lightCount);
    });

    const complexitySlider = document.getElementById("complexitySlider");
    const complexityLabel = document.getElementById("complexityLabel");
    complexitySlider.addEventListener("input",()=>{
        complexity=parseInt(complexitySlider.value);
        const labels=["Low","Medium","High"];
        complexityLabel.textContent=labels[complexity-1];
        createObjects(particleCount);
    });
}

// Start everything
window.addEventListener('load',()=>{
    init();
    initUI();
    animate();
});
