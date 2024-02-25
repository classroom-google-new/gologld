PROJECT.PRT.GUI=function(app,main)
{
    var here=this;
    var items=["heat_","boat_"];

    here.tk=0;
    here.app=app;
    here.main=main;

    here.on_down_functions=[];
    here.on_up_functions=[];
    here.on_move_functions=[];

    here.touch_x=0;
    here.touch_y=0;
    here.is_down=false;
    here.money=0;
    here.hero_id=0;
    here.items=[0,0];
    here.shop_items=[0,0];
    here.max_items=[0,0];
    
    here.get_value=function(res)
	{
		var prec=["","K","M","B","T","a","b","c","d","e","f","g","h","i","j","k","l","m","n","o","p","q","r","s","t","u","v","w","x","y","z"];
        var cnt=0;

        if (res<1000)
            res=Math.floor(res);

        while (res>=1000)
        {
            res/=1000;
            cnt++;
        }

        var str=""+res;
        if (res>=100)
            str=str.substr(0,3);
        else
            str=str.substr(0,4);

		var acnt=2;

		if (cnt>4)
		{
			cnt-=5;

			while (cnt>25)
			{
				cnt-=25;
				acnt++;
			}

			str+=" ";
			for (var i=0;i<acnt;i++)
			{
				str+=prec[cnt+5];
			}
			return str;
		}else return str+" "+prec[cnt];
    }

    here.get_kid=function(id,heat_id,boat_id)
    {
        function refresh_mesh(mesh)
        {
            mesh.material.color.r=0.95;
            mesh.material.color.g=0.95;
            mesh.material.color.b=0.95;
            mesh.geometry.computeVertexNormals();
        }

        var fbx=here.app.get_fbx("child_0"+id);
        fbx.stop();
        fbx.play_other("mixamo.com",here.main.anim_idle);
        fbx.my_data={};

        fbx.my_data.boat_id=boat_id;
        fbx.my_data.boat_left_bone=fbx.getObjectByName("mixamorig_LeftToeBase");
        fbx.my_data.left_boat=here.app.get_object("boat_"+fbx.my_data.boat_id);
        fbx.my_data.left_boat.position.y=-7;
        fbx.my_data.left_boat.position.z=-10;
        fbx.my_data.left_boat.rotation.x=Math.PI/2;
        fbx.my_data.left_boat.rotation.y=Math.PI;
        fbx.my_data.left_boat.scale.x=fbx.my_data.left_boat.scale.y=fbx.my_data.left_boat.scale.z=15;
        fbx.my_data.boat_left_bone.add(fbx.my_data.left_boat);

        fbx.my_data.boat_right_bone=fbx.getObjectByName("mixamorig_RightToeBase");
        fbx.my_data.right_boat=here.app.get_object("boat_"+fbx.my_data.boat_id);
        fbx.my_data.right_boat.position.y=-7;
        fbx.my_data.right_boat.position.z=-10;
        fbx.my_data.right_boat.rotation.x=Math.PI/2;
        fbx.my_data.right_boat.rotation.y=Math.PI;
        fbx.my_data.right_boat.scale.x=fbx.my_data.right_boat.scale.y=fbx.my_data.right_boat.scale.z=15;
        fbx.my_data.boat_right_bone.add(fbx.my_data.right_boat);

        
        fbx.my_data.head_bone=fbx.getObjectByName("mixamorig_Head");

        fbx.my_data.heat_id=heat_id;
        fbx.my_data.heat=here.app.get_object("heat_"+fbx.my_data.heat_id);
    
        fbx.my_data.heat.position.y=PROJECT.STR.items[0][fbx.my_data.heat_id].pos[0];
        fbx.my_data.heat.position.z=PROJECT.STR.items[0][fbx.my_data.heat_id].pos[1];
        fbx.my_data.heat.rotation.x=PROJECT.STR.items[0][fbx.my_data.heat_id].pos[2];
        fbx.my_data.heat.rotation.y=fbx.my_data.heat.rotation.z=0;
        fbx.my_data.heat.scale.x=fbx.my_data.heat.scale.y=fbx.my_data.heat.scale.z=PROJECT.STR.items[0][fbx.my_data.heat_id].pos[3];
        fbx.my_data.head_bone.add(fbx.my_data.heat);

        refresh_mesh(fbx.my_data.heat);
        refresh_mesh(fbx.my_data.right_boat);
        refresh_mesh(fbx.my_data.left_boat);

        fbx.free_kid=function()
        {
            this.my_data.left_boat.free();
            this.my_data.right_boat.free();
            this.my_data.heat.free();
            this.free();
        }

        return fbx;
    }

    function on_resize()
    {//постоянно вызывается на апдэйт
        if (here.wnd)
        {
            /*here.wnd.btn_no_snd.x=here.wnd.btn_no_snd.p_cx-here.app.dx;
            here.wnd.btn_snd.x=here.wnd.btn_snd.p_cx-here.app.dx;
            here.wnd.btn_shop.x=here.wnd.btn_shop.p_cx-here.app.dx;
            here.wnd.coin_back.x=here.wnd.coin_back.p_x+here.app.dx;
            here.wnd.btn_day.x=here.wnd.btn_day.p_cx+here.app.dx;
            here.wnd.main_back.x=here.wnd.main_back.p_x-here.app.dx;
            here.wnd.main_back.sx=(PROJECT.DAT.width+2*here.app.dx)/here.wnd.main_back.p_w;*/
        }

        if(here.msg)
        {
            if (here.msg.name_place)
            {
                here.htxt.style.left=Math.floor(here.app.dx*here.app.scale*here.app.gui_gfx.sx+((here.app.gui_gfx.position.x)+here.msg.name_place.x)*here.app.scale*here.app.gui_gfx.sx)+'px';
                here.htxt.style.top=Math.floor(here.app.dy*here.app.scale*here.app.gui_gfx.sx+here.msg.name_place.y*here.app.scale*here.app.gui_gfx.sx)+'px';
                here.htxt.style.width=Math.floor(here.app.scale*here.msg.name_place.p_w*here.app.gui_gfx.sx)+'px';
                here.htxt.style.height=Math.floor(here.app.scale*here.msg.name_place.p_h*here.app.gui_gfx.sx)+'px';
                here.htxt.style["font-size"]=Math.floor(here.msg.name_place.p_h*here.app.scale*0.75*here.app.gui_gfx.sx)+"px";
            }
        }
    }

    function on_down(obj,x,y,button)
    {
        here.is_down=true;
        here.touch_x=x;
        here.touch_y=y;

        for(var i=0;i<here.on_down_functions.length;i++)
            here.on_down_functions[i](obj,x,y,button);
    }

    function on_up(obj,x,y,button)
    {
        here.is_down=false;
        
        for(var i=0;i<here.on_up_functions.length;i++)
            here.on_up_functions[i](obj,x,y,button);
    }

    function on_move(obj,x,y,button)
    {
        here.touch_x=x;
        here.touch_y=y;

        for(var i=0;i<here.on_move_functions.length;i++)
            here.on_move_functions[i](obj,x,y,button);
    }

    
    function init()
    {
        load();

        here.app.on_update_functions.push(update);
        here.app.on_resize_functions.push(on_resize);
        
        here.wnd=PROJECT.OBJ.MAIN=here.app.show(PROJECT.WND.MAIN);
        here.wnd.back.interactive=true;
        here.wnd.back.x=-4*here.wnd.back.p_h;
        here.wnd.back.y=-4*here.wnd.back.p_h;
        here.wnd.back.sx=here.wnd.back.sy=20;
        
        here.wnd.back.avk.on_down=on_down;
        here.wnd.back.avk.on_up=on_up;
        here.wnd.back.avk.on_move=on_move;
        here.wnd.cur.visible=false;
        
//Поле ввода имени игрока
        here.htxt=document.createElement('INPUT');
        here.htxt.type="text";
        here.htxt.class="flat";
        here.htxt.onblur="this.className='flat'";
        here.htxt.style["background"]="transparent";
        here.htxt.style["z-index"]=1;
        here.htxt.style["font-family"]=PROJECT.STR.font_name;
        here.htxt.style["position"]="absolute";
        here.htxt.style["outline"]="none";
        here.htxt.style["border"]="none";
        here.htxt.style["color"]="#ffffff";
        here.htxt.maxLength=20;
        if (PROJECT.STR.player!="PLAYER")
            here.htxt.value=PROJECT.STR.player;
        else here.htxt.value="";
        here.htxt.placeholder=PROJECT.STR.get(10);
        //here.htxt.placeholder.style.color="#FFCCB2";

        //here.htxt.select();
        here.htxt.style.display="none";
        document.body.appendChild(here.htxt);

        here.skin_scene=new THREE.Scene();
        here.skin_scene.visible=false;

        var skin_light = new THREE.AmbientLight(0xffffff,1.1); // soft white light
        skin_light.position.set(0,100,20);
        here.skin_scene.add(skin_light);

        var skin_directionalLight = new THREE.DirectionalLight(0xffffff,0.7);
        skin_directionalLight.position.set(50,100,100);
        skin_directionalLight.target.position.set(0,0,0);
        here.skin_scene.add(skin_directionalLight);

        here.app.renderer.clear(true,true,true);
        here.app.renderer.render(here.app.scene_3d,here.app.camera_3d);
        here.app.renderer.render(here.app.scene,here.app.camera);

        function on_progressq(obj,progress,current_tk,action)
        {
            here.wnd.hint_place.sx=Math.cos(Math.PI*progress*2)*0.03+1;
            here.wnd.hint_place.sy=Math.sin(Math.PI*progress*2)*0.2+1;
            here.wnd.finger.x=here.wnd.finger.p_x+1+Math.sin(Math.PI*2*progress)*here.wnd.finger.p_w*5;
        }

        function on_finishq(obj,action,manual_stop)
        {
            here.app.start(null,0,2250,null,on_progressq,on_finishq);            
        }

        here.wnd.finger.centered();
        here.show_hint(false);
        on_finishq();

        on_resize();
        here.wnd.visible=false;
    }

    here.show_hint=function(vis)
    {
        here.wnd.hint.visible=vis;
    }


    function update(tk)
    {
        on_resize();
        here.tk+=tk;
        if ((here.msg)&&(here.msg.ray_gift))
        {
            here.msg.ray_gift.children[0].material.rotation-=tk/400;
        }

        if (here.skin_scene.visible)
        {
            here.skin_hero.mixer.update(tk/1000*1.3);
            here.skin_hero.rotation.y-=tk/400;
            here.skin_item.rotation.y-=tk/800;
            here.skin_hero.scale.x=here.skin_hero.scale.y=here.skin_hero.scale.z=PROJECT.DAT.height/8;
            here.app.renderer.render(here.skin_scene,here.app.camera_3d_second);
        }
    }

    here.start_particle=function()
    {
        for (var i=0;i<100;i++)
        {
            var part=PROJECT.WND.MSG.children["part_"+Math.floor(Math.random()*5)].copy(here.wnd);
            part.stx=part.x=PROJECT.DAT.width/2+PROJECT.DAT.width*(1-Math.random()*2)/2;//here.app.app_gfx.y/here.app.scale;
            part.sty=part.y=PROJECT.DAT.height*Math.random()-PROJECT.DAT.height/2;
            part.vs=Math.random()+3;
            part.tx=PROJECT.DAT.width/2+(Math.random()-0.5)*PROJECT.DAT.width*2;
            part.children[0].material.rotation=part.sr=(Math.random()-0.5)*Math.PI*2;
            part.r=(Math.random()-0.5)*Math.PI*2;
            part.sx=part.sy=0;

            function on_progress(obj,progress,current_tk,action)
            {
                obj.children[0].material.rotation=part.sr+progress*obj.r*6;
                obj.sy=Math.sin(progress*Math.PI);
                obj.sx=Math.sin(progress*Math.PI*8)*obj.sy;
                obj.y=obj.sty+progress*PROJECT.DAT.height;
                obj.x=obj.stx+Math.sin(Math.PI*progress)*(obj.tx-obj.stx);
            }

            function on_finish(obj,action,manual_stop)
            {
                obj.free();
            }

            here.app.start(part,0,part.vs*550,null,on_progress,on_finish);
        }
    }

    function logo_verify()
    {
        if ((here.msg)&&(here.msg.logo)&&(!here.msg.lg))
        {
            here.msg.lg=here.app.get_sprite("main");
            here.msg.lg.children[0].center.x=0.5;
            here.msg.lg.children[0].center.y=0.5;
            here.msg.lg.children[0].position.x=here.msg.logo.p_w/2;
            here.msg.lg.children[0].position.y=here.msg.logo.p_h/2;
            here.msg.logo.addChild(here.msg.lg);
        }
    }

    here.hint_num=0;
    function start_hint(obj,action,manual_stop)
    {//цикл показа хинтов
        if (manual_stop)
        {
            here.hint_action=null;
            return;
        }
        
        if ((here.msg)&&(here.msg.txt_first_hint))
        {
            here.hint_num++;
            
            if (here.hint_num>=PROJECT.STR.hints_count)
                here.hint_num=0;

            here.msg.txt_first_hint.text=PROJECT.STR.get(here.hint_num+100);
        }

        here.hint_action=here.app.start(null,0,3000,null,null,start_hint);
    }

    here.update_money=function()
    {
        if ((here.msg)&&(here.msg.coin_place))
        {
            here.msg.coin_place.txt_cost.text=here.get_value(here.money);
        }
    }

    function change_pos(napr)
    {
        here.shop_pos+=napr;
        if (here.shop_pos>=PROJECT.STR.items[here.shop_tab].length)
            here.shop_pos=0;
        
        if (here.shop_pos<0)
            here.shop_pos=PROJECT.STR.items[here.shop_tab].length-1;
        
        var r=here.skin_item.rotation.y;
        here.skin_item.free();
        here.skin_item=here.app.get_object(items[here.shop_tab]+here.shop_pos);

        here.shop_items[here.shop_tab]=here.shop_pos;
        here.msg.selected.visible=(here.shop_items[here.shop_tab]==here.items[here.shop_tab]);
        here.msg.lock.visible=(here.shop_items[here.shop_tab]>here.max_items[here.shop_tab]+1); 

        if (here.shop_items[here.shop_tab]<=here.max_items[here.shop_tab])
        {
            here.msg.btn_buy.visible=false;
            here.msg.btn_apply.visible=!here.msg.selected.visible;
        }else if (here.shop_items[here.shop_tab]==here.max_items[here.shop_tab]+1)
        {
            here.msg.btn_buy.visible=true;
            here.msg.btn_apply.visible=false;
        }else
        {
            here.msg.btn_buy.visible=false;
            here.msg.btn_apply.visible=false;
        }        

        if (here.shop_tab==0)
        {
            here.skin_item.scale.x=here.skin_item.scale.y=here.skin_item.scale.z=PROJECT.STR.items[0][here.shop_pos].pos[3];
            here.skin_item.position.y=-PROJECT.DAT.height*0.32+PROJECT.STR.items[0][here.shop_pos].pos[0]*0.5;
        }else  
        {
            here.skin_item.scale.x=here.skin_item.scale.y=here.skin_item.scale.z=35;
            here.skin_item.position.y=-PROJECT.DAT.height*0.3;
        }

        here.msg.txt_bay.text=here.app.convert(PROJECT.STR.items[here.shop_tab][here.shop_pos].price)+" "+PROJECT.STR.get(2);
        here.msg.txt_hint_name.text=PROJECT.STR.get(PROJECT.STR.items[here.shop_tab][here.shop_pos].hint_name_id);
        here.msg.txt_hint.text=PROJECT.STR.get(PROJECT.STR.items[here.shop_tab][here.shop_pos].hint_id);

        if (here.money>=PROJECT.STR.items[here.shop_tab][here.shop_pos].price)
        {
            here.msg.txt_bay.children[0].material.color.r=1;
            here.msg.txt_bay.children[0].material.color.g=1;
            here.msg.txt_bay.children[0].material.color.b=1;
        }else 
        {
            here.msg.txt_bay.children[0].material.color.r=1;
            here.msg.txt_bay.children[0].material.color.g=0;
            here.msg.txt_bay.children[0].material.color.b=0;
        }

        here.skin_item.rotation.y=r;
        here.skin_item.rotation.x=Math.PI/6;
        here.skin_scene.add(here.skin_item);

        var ry=here.skin_hero.rotation.y;
        here.skin_hero.free_kid();
        here.skin_hero=here.get_kid(here.hero_id,here.shop_items[0],here.shop_items[1]);
        here.skin_hero.position.y=-PROJECT.DAT.height/30;
        here.skin_hero.rotation.y=ry;
        here.skin_scene.add(here.skin_hero);
    }

    function shop_refresh()
    {
       for(var i=0;i<2;i++)
       {
           here.msg["btn_tab_"+i].visible=(i!=here.shop_tab);
           here.msg["back_tab_"+i].visible=(i==here.shop_tab);
       }
    }

    function save()
    {
        var dat={name:PROJECT.STR.player,id:here.hero_id,items:here.items,max_items:here.max_items,money:here.money};
        PROJECT.STR.save(dat);
    }

    function load()
    {//загружаем прогресс игрока
        var dat=PROJECT.STR.load();
        
        if (dat)
        {
            PROJECT.STR.player=dat.name;
            here.hero_id=dat.id;
            here.items=dat.items
            here.max_items=dat.max_items;
            here.money=dat.money;
            here.current_level=dat.current_level;
            here.tutorial=dat.tutorial;
        }else 
        {

        }

        if (here.tutorial<1000)
            here.tutorial=0;
    }
    
    here.earned=0;
    here.show_fail=function()
    {
        here.msg=here.app.show_msg(PROJECT.WND.MSG.children.fail);
        logo_verify();
        
        here.msg.lg.children[0].start_y=-PROJECT.DAT.height/3;
        here.msg.lg.children[0].finish_y=here.msg.lg.children[0].y;
        here.msg.lg.children[0].start_x=here.msg.lg.children[0].x;
        here.msg.lg.children[0].finish_x=here.msg.lg.children[0].x;
        
        here.show_smoothly(here.msg.lg.children[0],1500,500);


        here.msg.txt_task.start_x=here.msg.txt_task.x-PROJECT.DAT.height/2;
        here.msg.txt_task.finish_x=here.msg.txt_task.x;
        here.msg.txt_task.start_y=here.msg.txt_task.y;
        here.msg.txt_task.finish_y=here.msg.txt_task.y;

        here.show_smoothly(here.msg.txt_task,2000,500);

       here.msg.btn_cont.start_x=here.msg.btn_cont.x-PROJECT.DAT.height/2;
        here.msg.btn_cont.finish_x=here.msg.btn_cont.x;
        here.msg.btn_cont.start_y=here.msg.btn_cont.y;
        here.msg.btn_cont.finish_y=here.msg.btn_cont.y;

        here.show_smoothly(here.msg.btn_cont,2750,500);

        here.msg.btn_cont.avk.on_click=function()
        {
            here.app.hide_msg();
            here.msg=null;
            here.main.restart_game();
        }

        if (typeof(ShowDisplayAd)!="undefined")
            ShowDisplayAd();
    }

    here.show_smoothly=function(obj,pause,time)
    {
        function on_progress(obj,progress,current_tk,action)
        {
            obj.x=obj.start_x+(obj.finish_x-obj.start_x)*(progress+Math.sin(Math.PI*progress)*0.4);
            obj.y=obj.start_y+(obj.finish_y-obj.start_y)*(progress+Math.sin(Math.PI*progress)*0.4);
        }

        function on_finish(obj,action,manual_stop)
        {
            obj.enabled=true;            
        }

        function on_start(obj,action,manual_stop)
        {
            obj.visible=true;
            obj.enabled=false;
            obj.x=obj.start_x;
            obj.y=obj.start_y;
        }

        obj.visible=false;
        here.app.start(obj,pause,time,on_start,on_progress,on_finish,true);
    }

    here.show_win=function(fin_id,mul)
    {
        here.msg=here.app.show_msg(PROJECT.WND.MSG.children.win);
        logo_verify();

        here.earned=Math.floor((10-fin_id)*10)*mul;
        here.msg.txt_place.text=PROJECT.STR.get(20+fin_id);
        if (fin_id==0)
            here.msg.txt_earned.text=here.app.convert(here.app.convert(Math.floor((10-fin_id)*10))+" X "+mul+" = "+here.app.convert(here.earned));
        else here.msg.txt_earned.text=here.app.convert(here.earned);

        here.msg.coin_ico.x=here.msg.txt_earned.p_cx+here.msg.txt_earned.avk.txt.canvas.textWidth/2+here.msg.coin_ico.p_w/2;


        here.msg.lg.children[0].start_y=-PROJECT.DAT.height/3;
        here.msg.lg.children[0].finish_y=here.msg.lg.children[0].y;
        here.msg.lg.children[0].start_x=here.msg.lg.children[0].x;
        here.msg.lg.children[0].finish_x=here.msg.lg.children[0].x;
        
        here.show_smoothly(here.msg.lg.children[0],1500,500);


        here.msg.txt_place.start_x=here.msg.txt_place.x-PROJECT.DAT.height/2;
        here.msg.txt_place.finish_x=here.msg.txt_place.x;
        here.msg.txt_place.start_y=here.msg.txt_place.y;
        here.msg.txt_place.finish_y=here.msg.txt_place.y;

        here.show_smoothly(here.msg.txt_place,2000,500);

        here.msg.txt_earned.start_x=here.msg.txt_earned.x-PROJECT.DAT.height/2;
        here.msg.txt_earned.finish_x=here.msg.txt_earned.x;
        here.msg.txt_earned.start_y=here.msg.txt_earned.y;
        here.msg.txt_earned.finish_y=here.msg.txt_earned.y;

        here.show_smoothly(here.msg.txt_earned,2750,500);

        here.msg.coin_ico.start_x=here.msg.coin_ico.x;
        here.msg.coin_ico.finish_x=here.msg.coin_ico.x;
        here.msg.coin_ico.start_y=here.msg.coin_ico.y-PROJECT.DAT.height/2;
        here.msg.coin_ico.finish_y=here.msg.coin_ico.y;
        
        here.show_smoothly(here.msg.coin_ico,3000,500);

        here.msg.btn_rep.start_x=here.msg.btn_rep.x-PROJECT.DAT.height/2;
        here.msg.btn_rep.finish_x=here.msg.btn_rep.x;
        here.msg.btn_rep.start_y=here.msg.btn_rep.y;
        here.msg.btn_rep.finish_y=here.msg.btn_rep.y;

        here.show_smoothly(here.msg.btn_rep,3750,500);

        here.msg.btn_rep.avk.on_click=function()
        {
            here.money+=here.earned;
            here.update_money();
            here.app.hide_msg();
            here.msg=null;
            here.main.restart_game();
        }
        
        if (typeof(ShowDisplayAd)!="undefined")
            ShowDisplayAd();
    }

    here.show_gui=function(vis)
    {
        here.wnd.visible=true;

        here.msg=here.app.show_msg(PROJECT.WND.MSG.children.first);
        logo_verify();

        if (!here.hint_action)
            start_hint();
        here.htxt.style.display="";
        //here.htxt.select();

        here.msg.btn_replay.avk.on_click=function()
        {//обработчик нажатия кнопки 
            here.app.hide_msg();
            if ((PROJECT.STR.player!=here.htxt.value)&&(here.htxt.value!=""))
            {
                PROJECT.STR.player=here.htxt.value;
                PROJECT.STR.player_id=Math.floor(Math.random()*2000000000);
            }
            save();
            here.htxt.style.display='none';
            here.msg=null;
            here.hint_action.stop();

            here.main.begin_game();
        }

        here.msg.btn_skin.avk.on_click=function()
        {//обработчик нажатия кнопки 
		console.log('gui - skin click');
            if (typeof(HideAds)!="undefined")
                HideAds();

            if ((PROJECT.STR.player!=here.htxt.value)&&(here.htxt.value!=""))
            {
                PROJECT.STR.player=here.htxt.value;
                PROJECT.STR.player_id=Math.floor(Math.random()*2000000000);
            }
            save();
            here.app.hide_msg();
            here.msg=null;
            here.msg=here.app.show_msg(PROJECT.WND.MSG.children.skin);
            here.htxt.style.display="none";
            
            here.shop_tab=0;
            here.shop_pos=here.items[0];
            here.shop_items[0]=here.items[0];
            here.shop_items[1]=here.items[1];
            
            here.skin_scene.visible=true;
            here.skin_hero=here.get_kid(here.hero_id,here.shop_items[0],here.shop_items[1]);
            here.skin_hero.position.y=-PROJECT.DAT.height/30;
            here.skin_scene.add(here.skin_hero);

            here.skin_item=here.app.get_object(items[here.shop_tab]+here.shop_pos);
            here.skin_item.rotation.x=Math.PI/6;
            if (here.shop_tab==0)
            {
                here.skin_item.scale.x=here.skin_item.scale.y=here.skin_item.scale.z=PROJECT.STR.items[0][here.shop_pos].pos[3];
                here.skin_item.position.y=-PROJECT.DAT.height*0.32+PROJECT.STR.items[0][here.shop_pos].pos[0]*0.5;
            }else  
            {
                here.skin_item.scale.x=here.skin_item.scale.y=here.skin_item.scale.z=35;
                here.skin_item.position.y=-PROJECT.DAT.height*0.3;
            }
            
            here.skin_scene.add(here.skin_item);

            here.update_money();
            shop_refresh();
            change_pos(0);            

            here.msg.btn_back.avk.on_click=function()
            {//обработчик нажатия кнопки 
                here.skin_scene.visible=false;
                here.skin_hero.free_kid();
                here.skin_item.free();
                here.app.hide_msg();
                here.msg=null;
                here.msg=here.app.show_msg(PROJECT.WND.MSG.children.first);
                here.htxt.style.display="";
                if (typeof(ShowAds)!="undefined")
                    ShowAds();
            }

            here.msg.btn_tab_0.avk.on_click=function()
            {//обработчик нажатия кнопки 
                here.shop_tab=0;
                here.shop_pos=here.items[0];
                here.shop_items[0]=here.items[0];
                here.shop_items[1]=here.items[1];
                shop_refresh();
                change_pos(0);
            }

            here.msg.btn_tab_1.avk.on_click=function()
            {//обработчик нажатия кнопки 
                here.shop_tab=1;
                here.shop_pos=here.items[1];
                here.shop_items[0]=here.items[0];
                here.shop_items[1]=here.items[1];
                shop_refresh();
                change_pos(0);
            }

            here.msg.btn_l.avk.on_click=function()
            {//обработчик нажатия кнопки 
                change_pos(-1);
            }

            here.msg.btn_r.avk.on_click=function()
            {//обработчик нажатия кнопки 
                change_pos(1);
            }

            here.msg.btn_person_l.avk.on_click=function()
            {//обработчик нажатия кнопки 
                here.hero_id--;
                if (here.hero_id<0)
                    here.hero_id=PROJECT.STR.KIDS_NUM-1;

                var ry=here.skin_hero.rotation.y;
                here.skin_hero.free_kid();
                here.skin_hero=here.get_kid(here.hero_id,here.shop_items[0],here.shop_items[1]);
                here.skin_hero.position.y=-PROJECT.DAT.height/30;
                here.skin_hero.rotation.y=ry;
                here.skin_scene.add(here.skin_hero);
                save();
            }

            here.msg.btn_person_r.avk.on_click=function()
            {//обработчик нажатия кнопки 
                here.hero_id++;
                if (here.hero_id>=PROJECT.STR.KIDS_NUM)
                    here.hero_id=0;
                    
                var ry=here.skin_hero.rotation.y;
                here.skin_hero.free_kid();
                here.skin_hero=here.get_kid(here.hero_id,here.shop_items[0],here.shop_items[1]);
                here.skin_hero.position.y=-PROJECT.DAT.height/30;
                here.skin_hero.rotation.y=ry;
                here.skin_scene.add(here.skin_hero);
                save();
            }

            here.msg.btn_buy.avk.on_click=function()
            {//обработчик нажатия кнопки 
        
                if (here.money>=PROJECT.STR.items[here.shop_tab][here.shop_pos].price)
                {
                    here.money-=PROJECT.STR.items[here.shop_tab][here.shop_pos].price;
                    here.update_money();
                    here.items[here.shop_tab]=here.shop_pos;
                    here.max_items[here.shop_tab]++;
                    shop_refresh();;
                    change_pos(0);
                    save();
                }
            }

            here.msg.btn_apply.avk.on_click=function()
            {//обработчик нажатия кнопки 
                here.items[here.shop_tab]=here.shop_items[here.shop_tab];
                shop_refresh();
                change_pos(0);
                save();
            }

        }
    }

    init();
}
//PROJECT.STR.try_rewarded_ads
//PROJECT.STR.try_play_ads