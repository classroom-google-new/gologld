PROJECT.PRT.WATER=function(app,main)
{
    var here=this;

    here.app=app;
    here.main=main;

    here.water=here.app.get_object("water");
    here.water.position.y = -0.4;
    //here.water.material.transparent=true;
    here.water.material.opacity=0.85;
    here.water.material.side=THREE.DoubleSide;
    here.water.material.map.repeat.set(200,200);
    here.water.scale.set(200,200,200);
    here.water.material.color.r=here.water.material.color.g=here.water.material.color.b=1;


    here.show=function()
    {
        here.main.main_scene.add(here.water);
    }

    here.hide=function()
    {
        here.main.main_scene.remove(here.water);
    }
}