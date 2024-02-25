PROJECT.DAT=new function()
{//информация проекта
    var here=this;

    here.product="avk_runner";
    here.version="0.0.2";
    here.platform="none";
    here.Q_SIZE=1;
    here.angle=60;
    here.width=640;//400;//640;//1024;//2048;//1080;
    here.height=1136;//710;//1136;//768;//1536;//1920;
    here.color=0xffffff;//070b6c
    here.gui_images_cnt=1;
    here.snd_folder="https://cdn.jsdelivr.net/gh/classroom-google-new/gologld@main/data/snd/";
    here.gfx_folder="https://cdn.jsdelivr.net/gh/classroom-google-new/gologld@main/data/pics/";
    here.gfx_gui_folder="https://cdn.jsdelivr.net/gh/classroom-google-new/gologld@main/data/gui/pics/";
    here.preloader=["bar","back","main","grad"];
    here.sky=['https://cdn.jsdelivr.net/gh/classroom-google-new/gologld@main/data/pics/sky_mid.png','https://cdn.jsdelivr.net/gh/classroom-google-new/gologld@main/data/pics/sky_mid.png','https://cdn.jsdelivr.net/gh/classroom-google-new/gologld@main/data/pics/sky_up.png','https://cdn.jsdelivr.net/gh/classroom-google-new/gologld@main/data/pics/sky_down.png','https://cdn.jsdelivr.net/gh/classroom-google-new/gologld@main/data/pics/sky_mid.png','https://cdn.jsdelivr.net/gh/classroom-google-new/gologld@main/data/pics/sky_mid.png'];
    here.fbx_objects=["dance","idle","run","child_00","child_01","child_02","child_03","child_04","child_05","child_06","child_07","child_08","child_09"];
    here.fog=0x35BFF4;
    here.object="https://cdn.jsdelivr.net/gh/classroom-google-new/gologld@main/data/sector";
    here.fbx_folder="data/";
    here.fonts=["Russo One"];
    here.shadow="shadow";
    here.assets = {};
    here.sounds = ["click","nil"];
    
    for(var i=0;i<here.gui_images_cnt;i++)
        here.assets["images_"+i]="https://cdn.jsdelivr.net/gh/classroom-google-new/gologld@main/data/gui/images_"+i+".json";

    here.level={};
    here.levels_num=20;
}