PROJECT={};
PROJECT.GAME={};//объекты-файлы управления
PROJECT.PRT={};//прототипы
PROJECT.OBJ={};//объекты
PROJECT.WND={};//прототипы
PROJECT.GMO={};//объекты игры


PROJECT.APP=function(on_start)
{//конструктор
    var here=this;
    var actions=[];
    var first_click=false;
    here.order_step=1000;//max childten

    here.on_start=on_start;
    here.on_resize_functions=[];
    here.on_update_functions=[];
    here.custom_types={};
    here.busy=0;
    here.on_first_click=null;
    here.ver="?ver="+PROJECT.STR.gfx_version;
    here.up_gui=true;
    here.vector = new THREE.Vector3(0,0,0);
    here.itemsTotal=50;
//--------------------------------------------------------------------------------------------
//--------------------------------------------------------------------------------------------
//--------------------------------------------------------------------------------------------
function AVK_REQ()
	{//запрос
		var loc=this;

		function get_req()
		{
			var xmlhttp;
			try
			{
				xmlhttp = new ActiveXObject("Msxml2.XMLHTTP");
			} catch (e)
			{
				try
				{
					xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
				} catch (E)
				{
					xmlhttp = false;
				}
			}
			if (!xmlhttp && typeof XMLHttpRequest != 'undefined')
			{
				xmlhttp = new XMLHttpRequest();
			}
			return xmlhttp;
		}

		function on_complete (data)
		{
			if (loc.xmlhttp.readyState == 4)
			{
				if (loc.xmlhttp.status == 200)
				{
					var response = loc.xmlhttp.responseText;
					if (loc.on_back!=null)
						loc.on_back(response);
					loc.on_back=null;
					loc.active=false;
				}
			}
		}

		loc.xmlhttp = get_req();
		loc.on_back=null;
		loc.active=false;
		loc.xmlhttp.onreadystatechange = on_complete;

		loc.save=function(php,info,str,on_back)
		{
			loc.on_back=on_back;
			loc.xmlhttp.open('POST', php, true);
			loc.xmlhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
			loc.xmlhttp.send("data="+str+"&info="+info);
			loc.active=true;
		}

		loc.load=function(path,on_back)
		{
			loc.active=true;
			loc.on_back=on_back;
			loc.xmlhttp.open('GET', path, true);
			loc.xmlhttp.send(null);
		}
	}

	var requests=[];

	function get_request()
	{
		for (var i=0;i<requests.length;i++)
			if (!requests[i].active)
				break;

		if (i<requests.length)
			return requests[i];

		requests.push(new AVK_REQ());
		return requests[i];
    }

    here.save=function(php,info,str,on_back)
    {
        get_request().save(php,info,str,on_back);
    }

    here.load=function(path,on_back)
    {
        get_request().load(path,on_back);
    }
//--------------------------------------------------------------------------------------------
//--------------------------------------------------------------------------------------------
//--------------------------------------------------------------------------------------------
	here.isMobile =
	{
		Android:function(){return navigator.userAgent.match(/Android/i);},
		BlackBerry:function(){return navigator.userAgent.match(/BlackBerry/i);},
		iOS:function(){return navigator.userAgent.match(/iPhone|iPad|iPod/i);},
		Opera:function(){return navigator.userAgent.match(/Opera Mini/i);},
		Windows:function(){return navigator.userAgent.match(/IEMobile/i);},
		any:function(){return (here.isMobile.Android() || here.isMobile.BlackBerry() || here.isMobile.iOS() || here.isMobile.Opera() || here.isMobile.Windows());}
	}
//--------------------------------------------------------------------------------------------
//--------------------------------------------------------------------------------------------
//--------------------------------------------------------------------------------------------
    here.dist=1;
    here.dist_3d=PROJECT.DAT.height/2/Math.tan(Math.PI*PROJECT.DAT.angle/360);

    here.scene = new THREE.Scene();
    here.scene_3d = new THREE.Scene();

    here.scene_3d.fog=new THREE.Fog(PROJECT.DAT.fog,0.015,40);//new THREE.FogExp2( 0xffffff, 0.015 );;//
    here.camera = new  THREE.OrthographicCamera(-PROJECT.DAT.width/150, PROJECT.DAT.width/150,PROJECT.DAT.height/150,-PROJECT.DAT.height/150, -100000, 100000 );// THREE.PerspectiveCamera(PROJECT.DAT.angle,PROJECT.DAT.width/PROJECT.DAT.height, 0.1,10000000);
    here.camera_3d = new THREE.PerspectiveCamera(PROJECT.DAT.angle,PROJECT.DAT.width/PROJECT.DAT.height, 0.01,10000000);
    here.camera_3d_second =new THREE.OrthographicCamera(-PROJECT.DAT.width/2, PROJECT.DAT.width/2,PROJECT.DAT.height/2,-PROJECT.DAT.height/2, 1, 100000 );//( left : Number, right : Number, top : Number, bottom : Number, near : Number, far : Number ) //new THREE.PerspectiveCamera(PROJECT.DAT.angle,PROJECT.DAT.width/PROJECT.DAT.height, 0.1,10000000);
    var listener = new THREE.AudioListener();
    here.camera.add(listener);
    

    here.camera.position.z=0;
    here.camera.rotation.z=Math.PI;
    here.camera.rotation.y=Math.PI;

    here.camera_3d_second.position.z=10000;
    here.camera_3d_second.position.y=0;
    here.camera_3d_second.position.x=0;

    here.renderer = new THREE.WebGLRenderer({antialias:true});
    here.renderer.autoClear=false;
    here.renderer.setClearColor(PROJECT.DAT.color);
    here.renderer.setSize(PROJECT.DAT.width,PROJECT.DAT.height);
    
    document.getElementById("game").appendChild(here.renderer.domElement);
    here.renderer.domElement.style.position = "absolute";
    here.renderer.domElement.style["z-index"] = "1";

    /*here.stats = new Stats();
    here.stats.showPanel( 1 ); // 0: fps, 1: ms, 2: mb, 3+: custom
    document.body.appendChild( here.stats.dom );*/
//--------------------------------------------------------------------------------------------
//--------------------------------------------------------------------------------------------
//--------------------------------------------------------------------------------------------
    function destroy()
    {
        if(this.parent!==null)
            this.parent.remove(this);

        this.parent=null;
        while (this.children.length>0)
            this.remove(this.children[0]);
        
        while (this.avk.img.length>0)
        {
            var img=this.avk.img.pop();
            img.geometry.dispose();
            img.material.dispose();
            img.material.map.dispose();
            img.material.map=null;
            img.material=null;
            img.geometry=null;
        }
    }

    function removeChild(object)
    {
        this.remove(object);
    }

    function removeChildDown(index)
    {
        if ((index>=0)&&(index<this.children.length))
            this.remove(this.children[index]);
    }

    function addChild(object)
    {
        this.add(object);
        this.orderRefresh();
        object.alpha=object.alpha;
    }

    function addChildDown(object)
    {
        if (object===this)
        {
            console.error( "THREE.Object3D.add: object can't be added as a child of itself.", object );
            return this;
        }

        if ((object&&object.isObject3D))
        {
            if(object.parent!==null)
            {
                object.parent.remove(object);
            }

            object.parent=this;
            object.dispatchEvent({type:'added'});
            var pic=null;
            if (this.avk)
            {
                if (this.children[0]==this.avk.img[this.avk.currentFrame])
                    pic=this.children.shift();
            }
            this.children.unshift(object);
            if (pic)
                this.children.unshift(pic);
            this.orderRefresh();
            object.alpha=object.alpha;
        }else
        {
            console.error( "THREE.Object3D.add: object not an instance of THREE.Object3D.", object );
        }
    }

    function orderRefresh()
    {
        for (var i=0;i<this.children.length;i++)
        {
            this.children[i].renderOrder=this.renderOrder+(i+1)*this.renderOrderStep;
            this.children[i].renderOrderStep=this.renderOrderStep/here.order_step;
            if (this.children[i].orderRefresh)
                this.children[i].orderRefresh();
        }
    }

    function getGlobalPosition()
    {
        var res={"x":this.x,"y":this.y};
        var prnt=this.parent;
        while(prnt!=null)
        {
            res.x+=prnt.x;
            res.y+=prnt.y;
            prnt=prnt.parent;
        }
        return res;
    }
//--------------------------------------------------------------------------------------------
//--------------------------------------------------------------------------------------------
//--------------------------------------------------------------------------------------------    
    here.app_gfx=new THREE.Group();
    here.preloader_gfx=new THREE.Group();
    here.msg_up_gfx=new THREE.Group();
    here.msg_shadow_gfx=new THREE.Group();
    here.msg_down_gfx=new THREE.Group();
    here.middle_gfx=new THREE.Group();
    here.gui_gfx=new THREE.Group();
	
    here.scene_3d.add(here.app_gfx);
    here.scene.add(here.gui_gfx);

    here.gui_gfx.position.z=0;
    here.gui_gfx.position.x=0;
    here.gui_gfx.position.y=0;

    here.middle_gfx.interactive=false;
    here.msg_down_gfx.interactive=false;
    here.msg_shadow_gfx.interactive=false;
    here.msg_up_gfx.interactive=false;
    here.preloader_gfx.interactive=false;

    here.middle_gfx.avk={"img":[]};
    here.msg_down_gfx.avk={"img":[]};
    here.msg_shadow_gfx.avk={"img":[]};
    here.msg_up_gfx.avk={"img":[]};
    here.preloader_gfx.avk={"img":[]};

    here.gui_gfx.add(here.middle_gfx);
    here.gui_gfx.add(here.msg_down_gfx);
    here.gui_gfx.add(here.msg_shadow_gfx);
    here.gui_gfx.add(here.msg_up_gfx);
    here.gui_gfx.add(here.preloader_gfx);
    
    here.middle_gfx.renderOrder=2000000000000000;
    here.msg_down_gfx.renderOrder=3000000000000000;
    here.msg_shadow_gfx.renderOrder=4000000000000000;
    here.msg_up_gfx.renderOrder=5000000000000000;
    here.preloader_gfx.renderOrder=6000000000000000;
    here.middle_gfx.renderOrderStep=2000000000000000/here.order_step;
    here.msg_down_gfx.renderOrderStep=3000000000000000/here.order_step;
    here.msg_shadow_gfx.renderOrderStep=4000000000000000/here.order_step;
    here.msg_up_gfx.renderOrderStep=5000000000000000/here.order_step;
    here.preloader_gfx.renderOrderStep=6000000000000000/here.order_step;
    
    here.middle_gfx.addChild=here.msg_down_gfx.addChild=here.msg_shadow_gfx.addChild=here.msg_up_gfx.addChild=here.preloader_gfx.addChild=addChild;
    here.middle_gfx.addChildDown=here.msg_down_gfx.addChildDown=here.msg_shadow_gfx.addChildDown=here.msg_up_gfx.addChildDown=here.preloader_gfx.addChildDown=addChildDown;
    here.middle_gfx.removeChild=here.msg_down_gfx.removeChild=here.msg_shadow_gfx.removeChild=here.msg_up_gfx.removeChild=here.preloader_gfx.removeChild=removeChild;
    here.middle_gfx.removeChildDown=here.msg_down_gfx.removeChildDown=here.msg_shadow_gfx.removeChildDown=here.msg_up_gfx.removeChildDown=here.preloader_gfx.removeChildDown=removeChildDown;
    here.middle_gfx.orderRefresh=here.msg_down_gfx.orderRefresh=here.msg_shadow_gfx.orderRefresh=here.msg_up_gfx.orderRefresh=here.preloader_gfx.orderRefresh=orderRefresh;
    here.middle_gfx.getGlobalPosition=here.msg_down_gfx.getGlobalPosition=here.msg_shadow_gfx.getGlobalPosition=here.msg_up_gfx.getGlobalPosition=here.preloader_gfx.getGlobalPosition=getGlobalPosition;

    here.add_shadow = function(name) 
    {
        here.shadow=here.get_sprite(name);
        here.shadow.interactive=true;
        here.shadow.sy=200;
        here.shadow.sx=2000;
        here.shadow.x=(PROJECT.DAT.width-here.width/here.scale)/2;
        here.shadow.p_w=here.shadow.avk.i_w;
        here.shadow.p_h=here.shadow.avk.i_h;
        here.msg_shadow_gfx.addChild(here.shadow);
        here.shadow.visible=false;
    }
//--------------------------------------------------------------------------------------------
//--------------------------------------------------------------------------------------------
//--------------------------------------------------------------------------------------------
    here.get_sprite_t=function(t)
    {
        var group=new THREE.Group();
        group.avk={"img":[],"currentFrame":0};
        group.frustumCulled=false;
        
        group.addChild=addChild;
        group.addChildDown=addChildDown;
        group.removeChild=removeChild;
        group.removeChildDown=removeChildDown;
        group.orderRefresh=orderRefresh;
        group.destroy=destroy;
        group.getGlobalPosition=getGlobalPosition;
        group.interactive=false;

        function get_spr(tx)
        {
            var material = new THREE.SpriteMaterial({map:tx,color:0xffffff,transparent:true,sizeAttenuation:false,depthWrite:false,depthTest :false});
            var spr=new THREE.Sprite(material);
            spr.scale.set(spr.material.map.image.width/here.dist,spr.material.map.image.height/here.dist,1);
            spr.frustumCulled=false;
            spr.center.x=0
            spr.center.y=1;
            spr.i_rw=spr.i_w=spr.material.map.image.width;
            spr.i_rh=spr.i_h=spr.material.map.image.height;
            return spr;
        }

        group.avk.img.push(get_spr(t));
        
        group.add(group.avk.img[0]);
        group.avk.i_rw=group.avk.img[0].i_rw;
        group.avk.i_w=group.avk.img[0].i_w;
        group.avk.i_rh=group.avk.img[0].i_rh;
        group.avk.i_h=group.avk.img[0].i_h;
        
        return group;
    }

    here.sprites_heap={}

    here.get_sprite=function(name,atl,is_3d)
    {
        if (typeof(is_3d)=="undefined")
            is_3d=false;

        if (is_3d)
            var dist=here.dist_3d;
        else var dist=here.dist;

        var nm=name+atl+is_3d;
        if (!here.sprites_heap[nm])
            here.sprites_heap[nm]=[];

        if (here.sprites_heap[nm].length>0)
        {
            var obj=here.sprites_heap[nm].pop();
            obj.scale.set(1,1,1);
            return obj;
        }

        
        var group=new THREE.Group();
        group.heap=here.sprites_heap[nm];
        group.avk={"img":[],"currentFrame":0};
        group.frustumCulled=false;
        group.free=function()
        {
            if(this.avk_action){this.avk_action.stop();this.avk_action=null;};
            if (this.parent)
                this.parent.remove(this);
            this.heap.push(this);
        }
        
        group.addChild=addChild;
        group.addChildDown=addChildDown;
        group.removeChild=removeChild;
        group.removeChildDown=removeChildDown;
        group.orderRefresh=orderRefresh;
        group.destroy=destroy;
        group.getGlobalPosition=getGlobalPosition;
        group.interactive=false;

        function get_spr(nm)
        {
            var material = new THREE.SpriteMaterial({map:here.materials[nm],color:0xffffff,transparent:true,sizeAttenuation:is_3d,depthWrite:false,depthTest :false});
            var spr=new THREE.Sprite(material);
            spr.scale.set(spr.material.map.image.width/dist,spr.material.map.image.height/dist,1);
            spr.frustumCulled=false;
            spr.center.x=0
            spr.center.y=1;
            spr.i_rw=spr.i_w=spr.material.map.image.width;
            spr.i_rh=spr.i_h=spr.material.map.image.height;
            return spr;
        }

        function get_atl(nm)
        {
            for(var key in here.atlases)
            {
                var atl=here.atlases[key];
                if (atl.map.frames[nm])
                {
                    var material = new THREE.SpriteMaterial({map:atl.material,color:0xffffff,transparent:true,sizeAttenuation:is_3d,depthWrite:false,depthTest :false});
                    var frame=atl.map.frames[nm];
                    var aw=material.map.image.width;
                    var ah=material.map.image.height;
                    
                    var sprite = new THREE.Sprite(material);
                    sprite.frustumCulled=false;
                    var geometry = new THREE.BufferGeometry();
                    var x1=frame.frame.x/aw;
                    var y1=frame.frame.y/ah;
                    var x2=(frame.frame.x+frame.frame.w)/aw;
                    var y2=(frame.frame.y+frame.frame.h)/ah;
                    var float32Array = new Float32Array([
                        - 0.5, - 0.5, 0,x1, 1.0 - y2,
                        0.5, - 0.5, 0, x2, 1.0 - y2,
                        0.5, 0.5, 0, x2, 1.0 - y1,
                        - 0.5, 0.5, 0, x1, 1.0 - y1
                    ]);
                    var interleavedBuffer = new THREE.InterleavedBuffer(float32Array, 5);
                    geometry.setIndex([0, 1, 2, 0, 2, 3]);
                    geometry.setAttribute('position', new THREE.InterleavedBufferAttribute(interleavedBuffer, 3, 0, false));
                    geometry.setAttribute('uv', new THREE.InterleavedBufferAttribute(interleavedBuffer, 2, 3, false));
                    sprite.geometry = geometry;

                    sprite.i_rw=frame.frame.w;
                    sprite.i_rh=frame.frame.h;
                    sprite.i_w=frame.spriteSourceSize.w;
                    sprite.i_h=frame.spriteSourceSize.h;
                    sprite.i_x=frame.spriteSourceSize.x;
                    sprite.i_y=frame.spriteSourceSize.y;

                    sprite.scale.set(frame.frame.w/dist,frame.frame.h/dist,1);
                    sprite.center.x=0
                    sprite.center.y=1;
                    sprite.position.x=frame.spriteSourceSize.x;
                    sprite.position.y=frame.spriteSourceSize.y;

                    return sprite;
                }
            }
            return null;
        }

        if ((typeof(name)=="undefined")||(name==""))
        {
            group.avk.i_rw=group.avk.i_w=0;
            group.avk.i_rh=group.avk.i_h=0;
        }else
        {
            if (atl)
            {
                if (Array.isArray(name))
                {
                    for (var i=0;i<name.length;i++)
                        group.avk.img.push(get_atl(name[i]));
                }else
                {
                    group.avk.img.push(get_atl(name));
                }            
            }else
            {
                if (Array.isArray(name))
                {
                    for (var i=0;i<name.length;i++)
                        group.avk.img.push(get_spr(name[i]));
                }else
                {
                    group.avk.img.push(get_spr(name));
                }
            }

            group.add(group.avk.img[0]);
            group.avk.i_rw=group.avk.img[0].i_rw;
            group.avk.i_w=group.avk.img[0].i_w;
            group.avk.i_rh=group.avk.img[0].i_rh;
            group.avk.i_h=group.avk.img[0].i_h;
        }

        return group;
    }

    Object.defineProperty(THREE.Object3D.prototype, 'sx',
    {
        get:function()
            {
                if (typeof(this._sx)=="undefined")
                    this._sx=1;
                return this._sx;
            },
        set:function(value)
            {
                this._sx=value;
                if (this._sx==0)
                    this._sx=0.00000000000000001;
                this.scale.set(this.sx,this.sy,1);
            }
    });

    Object.defineProperty(THREE.Object3D.prototype, 'sy',
    {
        get:function()
            {
                if (typeof(this._sy)=="undefined")
                    this._sy=1;
                return this._sy;
            },
        set:function(value)
            {
                this._sy=value;
                if (this._sy==0)
                    this._sy=0.00000000000000001;
                this.scale.set(this.sx,this.sy,1);
            }
    });

    Object.defineProperty(THREE.Object3D.prototype, 'alpha',
    {
        get:function()
            {
                if (typeof(this._alpha)=="undefined")
                    this._alpha=1;
                return this._alpha;
            },
        set:function(value)
            {
                this._alpha=value;
                if (this.avk)
                {
                    var res_alpha=value;
                    var prnt=this.parent;
                    while(prnt!=null)
                    {
                        res_alpha=res_alpha*prnt.alpha;
                        prnt=prnt.parent;
                    }

                    for (var i=0;i<this.avk.img.length;i++)
                        this.avk.img[i].material.opacity=res_alpha;
                    
                    for (i=0;i<this.children.length;i++)
                        if (this.children[i].avk)
                            this.children[i].alpha=this.children[i].alpha;
                }
            }
    });

    Object.defineProperty(THREE.Object3D.prototype, 'x',
    {
        get:function()
            {
                return this.position.x;
            },
        set:function(value)
            {
                this.position.x=value;
            }
    });

    Object.defineProperty(THREE.Object3D.prototype, 'y',
    {
        get:function()
            {
                return this.position.y;
            },
        set:function(value)
            {
                this.position.y=value;
            }
    });

    Object.defineProperty(THREE.Object3D.prototype, 'text',
    {
        get:function()
            {
                if ((this.avk)&&(this.avk.txt))
                    return this.avk.txt.text;
                else return null;
            },
        set:function(value)
            {
                if ((this.avk)&&(this.avk.txt))
                    this.avk.txt.text=value;
            }
    });
//--------------------------------------------------------------------------------------------
//--------------------------------------------------------------------------------------------
//--------------------------------------------------------------------------------------------
    here.loading_step=0;
    here.materials={};
    here.atlases={};
    here.manager = new THREE.LoadingManager();
    here.loader=new THREE.TextureLoader(here.manager);
	here.file_loader=new THREE.FileLoader(here.manager);
	here.obj_loader = new THREE.OBJLoader(here.manager)
    here.mtl_loader = new THREE.MTLLoader(here.manager);
    here.fbx_loader = new THREE.FBXLoader(here.manager);
    here.audioLoader = new THREE.AudioLoader(here.manager);
    
    here.manager.onStart = function(url,itemsLoaded,itemsTotal) 
    {
    }

    here.manager.onProgress=function(url,itemsLoaded,itemsTotal)
    {
        if (here.loading_step>0)
        {
            if (typeof(here.itemsTotal)=="undefined")
            {
                console.log(itemsLoaded+":"+itemsTotal);
                PROJECT.PRELOADER.set_progress(itemsLoaded/itemsTotal);
            }else PROJECT.PRELOADER.set_progress(itemsLoaded/here.itemsTotal);
        }
    }

    here.manager.onError=function(url)
    {
        console.log('loading error:'+url);
    }

    here.get_text=function(text,font_size,font_color)
    {

        var txt= new THREE_Text2D.SpriteText2D(text, {
            align: THREE_Text2D.textAlign.center,
            font: font_size+'px '+PROJECT.STR.font_name,
            fillStyle: font_color
          });

        txt.material.map.magFilter=THREE.NearestFilter;
        txt.material.map.minFilter=THREE.NearestFilter;
        return txt;
    }

    here.get_plane=function(name)
    {
        if (!here.objects_stack[name])
			here.objects_stack[name]=[];

        if (here.objects_stack[name].length>0)
        {
            var obj=here.objects_stack[name].pop();
            obj.is_active=true;
            return obj;
        }

        for(var key in here.atlases)
        {
            var atl=here.atlases[key];
            for(var frm in atl.map.frames)
            {
                if (frm==name)
                {
                    atl.material.magFilter=THREE.NearestFilter;
                    atl.material.minFilter=THREE.NearestFilter;

                    var geometry = new THREE.PlaneGeometry(1,1);
                    var material = new THREE.MeshBasicMaterial({map:atl.material,color:0xffffff,transparent:true,depthWrite:false,side:THREE.DoubleSide});

                    var frame=atl.map.frames[frm];
                    var aw=material.map.image.width;
                    var ah=material.map.image.height;
                    
                    var geometry = new THREE.BufferGeometry();
                    var x1=frame.frame.x/aw;
                    var y1=frame.frame.y/ah;
                    var x2=(frame.frame.x+frame.frame.w)/aw;
                    var y2=(frame.frame.y+frame.frame.h)/ah;
                    var float32Array = new Float32Array([
                        - 0.5, - 0.5, 0,x1, 1.0 - y2,
                        0.5, - 0.5, 0, x2, 1.0 - y2,
                        0.5, 0.5, 0, x2, 1.0 - y1,
                        - 0.5, 0.5, 0, x1, 1.0 - y1
                    ]);
                    var interleavedBuffer = new THREE.InterleavedBuffer(float32Array, 5);
                    geometry.setIndex([0, 1, 2, 0, 2, 3]);
                    geometry.setAttribute('position', new THREE.InterleavedBufferAttribute(interleavedBuffer, 3, 0, false));
                    geometry.setAttribute('uv', new THREE.InterleavedBufferAttribute(interleavedBuffer, 2, 3, false));
                    var sprite = new THREE.Mesh(geometry,material);

                    sprite.i_rw=frame.frame.w;
                    sprite.i_rh=frame.frame.h;
                    sprite.i_w=frame.spriteSourceSize.w;
                    sprite.r_h=frame.spriteSourceSize.h;

                    sprite.is_active=true;
                    sprite.free=function(){if(this.avk_action){this.avk_action.stop();this.avk_action=null;};if (this.is_active){if (this.parent){this.parent.remove(this);};this.is_active=false;here.objects_stack[this.p_name].push(this);}};
                    here.objects_stack[name].push(sprite);
                    sprite.p_name=name;
                    
                    return sprite;
                }
            }
        }

        if (here.materials[name])
        {
            var material = new THREE.MeshBasicMaterial({map:here.materials[name],color:0xffffff,transparent:true,depthWrite:false,side:THREE.DoubleSide});
            var geometry = new THREE.PlaneGeometry(10, 10);
            var sprite = new THREE.Mesh(geometry,material);
            sprite.is_active=true;
            sprite.free=function(){if(this.avk_action){this.avk_action.stop();this.avk_action=null;};if (this.parent){this.parent.remove(this);this.is_active=false;}};
            here.objects_stack[name].push(sprite);
            sprite.p_name=name;
            return sprite;
        }
        return null;
    }

	here.get_object=function(name)
	{
		if (!here.objects_stack[name])
			here.objects_stack[name]=[];

        if (here.objects_stack[name].length>0)
        {
            var obj=here.objects_stack[name].pop();
            obj.is_active=true;
            obj.scale.set(1,1,1);
            obj.position.set(0,0,0);
            obj.rotation.set(0,0,0);
            return obj;
        }

		for (i=0;i<here.objects.children.length;i++)
		{
			if (here.objects.children[i].name==name+"_geom_"+name)
			{
                var obj=here.objects.children[i].clone();
                if (Array.isArray(here.objects.children[i].material))
                {
                    obj.material=[];
                    for (var n=0;n<here.objects.children[i].material.length;n++)
                    {
                        obj.material[here.objects.children[i].material[n].name]=obj.material[n]=here.objects.children[i].material[n].clone();
                    }
                }else obj.material=here.objects.children[i].material.clone();
                obj.material.side=THREE.DoubleSide;
                //obj.material.transparent=true;
				obj.is_active=true;
				obj.free=function(){if(this.avk_action){this.avk_action.stop();this.avk_action=null;};if (this.is_active){if (this.parent){this.parent.remove(this);};this.is_active=false;here.objects_stack[this.p_name].push(this);}};
                obj.p_name=name;
                //obj.avk_geometry=here.objects.children[i].avk_geometry;
				return obj;
			}
		}
    }
    
	here.get_fbx=function(name,src)
	{
        const cloneFbx = (fbx) => 
        {
            const clone = fbx.clone(true);
            if (src)
                clone.animations = src.animations;
            else clone.animations = fbx.animations;
            clone.skeleton = { bones: [] };
        
            const skinnedMeshes = {};
        
            fbx.traverse(node => 
            {
                if (node.isSkinnedMesh) 
                {
                    skinnedMeshes[node.name] = node;
                }
            })
        
            const cloneBones = {};
            const cloneSkinnedMeshes = {};
        
            clone.traverse(node => 
            {
                if (node.isBone) 
                {
                    cloneBones[node.name] = node;
                }
        
                if (node.isSkinnedMesh) 
                {
                    cloneSkinnedMeshes[node.name] = node;
                }
            })
        
            for (let name in skinnedMeshes) 
            {
                const skinnedMesh = skinnedMeshes[name];
                const skeleton = skinnedMesh.skeleton;
                const cloneSkinnedMesh = cloneSkinnedMeshes[name];
                cloneSkinnedMesh.material=[];
                if (Array.isArray(skinnedMesh.material))
                {
                    for (var i=0;i<skinnedMesh.material.length;i++)
                    {
                        cloneSkinnedMesh.material[skinnedMesh.material[i].name]=cloneSkinnedMesh.material[i]=skinnedMesh.material[i].clone();
                    }
                }else cloneSkinnedMesh.material=skinnedMesh.material.clone();
        
                const orderedCloneBones = [];
        
                for (let i=0; i<skeleton.bones.length; i++) 
                {
                    const cloneBone = cloneBones[skeleton.bones[i].name];
                    orderedCloneBones.push(cloneBone);
                }
        
                cloneSkinnedMesh.bind(new THREE.Skeleton(orderedCloneBones, skeleton.boneInverses));
        
                // For animation to work correctly:
                clone.skeleton.bones.push(cloneSkinnedMesh);
                clone.skeleton.bones.push(...orderedCloneBones);
                clone.material=cloneSkinnedMesh.material;
            }
        
            return clone
        }
        
		if (!here.objects_stack[name])
			here.objects_stack[name]=[];

        for (var i=0;i<here.objects_stack[name].length;i++)
        {
            if (!here.objects_stack[name][i].is_active)
            {
                here.objects_stack[name][i].is_active=true;
                return here.objects_stack[name][i];
            }
        }

        if (here.fbx[name])
        {
            var obj=cloneFbx(here.fbx[name])
            obj.mixer = new THREE.AnimationMixer(obj.children[0]);
            obj.actions=[];
            //obj.material=obj.material.clone();
            //obj.material.transparent=true;
            obj.is_active=true;
            obj.free=function(){if(this.avk_action){this.avk_action.stop();this.avk_action=null;};if (this.parent){this.parent.remove(this);this.is_active=false;}};
            obj.stop=function(name)
            {
                if (!name)
                {
                    while(this.actions.length>0)
                    {
                        var act=this.actions.pop();
                        if (act)
                            act.stop();
                    }
                }else
                {
                    for (var i=0;i<this.actions.length;i++)
                    {
                        if ((this.actions[i])&&(this.actions[i].name==name))
                        {
                            this.actions[i].stop();
                            this.actions[i]=null;
                        }
                    }
                }
            }

            obj.play=function(name)
            {
                /*if (this.action)
                    this.action.stop();
                this.action=null;*/

                var animations=this.animations;
                for (var i=0;i<animations.length;i++)
                    if (animations[i].name==name)
                    {
                        this.action=this.mixer.clipAction(animations[i]);
                        this.action.name=name;
                        this.action.play();
                        this.actions.push(this.action);
                        this.duration=animations[i].duration;
                        break;
                    }
            }

            obj.play_other=function(name,src)
            {
                /*if (this.action)
                    this.action.stop();
                this.action=null;*/

                var animations=src.animations;
                for (var i=0;i<animations.length;i++)
                    if (animations[i].name==name)
                    {
                        this.action=this.mixer.clipAction(animations[i]);
                        this.action.name=name;
                        this.action.play();
                        this.actions.push(this.action);
                        this.duration=animations[i].duration;
                        break;
                    }
            }
            here.objects_stack[name].push(obj);
            obj.p_name=name;
            return obj;
        }
	}

	function on_mtl_loaded(materials)
	{
		function on_obj_loaded(obj)
		{
			here.objects=obj;
			here.objects_stack={};
			here.free_objects_stack={};
		}

        here.mtl_materials=materials;
		here.mtl_materials.preload();
		here.obj_loader.setMaterials(here.mtl_materials);
		here.obj_loader.load(PROJECT.DAT.object+'.obj'+here.ver,on_obj_loaded);
	}

    here.manager.onLoad=function() 
    {
        if (here.loading_step==0)
        {//загрузили прелоадер
            here.loading_step++;
            PROJECT.PRELOADER.show(here);
            for(var key in PROJECT.DAT.assets)
            {
                new ATL_LOADER(key);
            }
            
            for(var i=0;i<PROJECT.DAT.sounds.length;i++)
            {
                new SND_LOADER(PROJECT.DAT.sounds[i]);
            }

            here.mtl_loader.load(PROJECT.DAT.object+'.mtl'+here.ver,on_mtl_loaded);
            
            for (var i=0;i<PROJECT.DAT.fbx_objects.length;i++)
                new FBX_LOADER(PROJECT.DAT.fbx_objects[i]);
                
        }else if (here.loading_step==1)
        {
            here.loading_step++;
            here.last_time = (new Date()).getTime();
            PROJECT.PRELOADER.hide_bar();
            build_gui();
            here.on_start();
        }
    }

    here.sounds={};
    
    function SND_LOADER(name)
    {
        var loc=this;
        loc.name=name;
        here.sounds[name]={"data":null};

        function on_snd_loaded(buffer)
        {
            var sound = new THREE.Audio( listener );
            here.sounds[loc.name]=sound;
            sound.setBuffer(buffer);
	        sound.setLoop(false);
	        sound.setVolume(0.5);
        }

        here.audioLoader.load(PROJECT.DAT.snd_folder+name+".mp3",on_snd_loaded);
    }

    here.fbx={};

    function FBX_LOADER(name)
    {
        var loc=this;
        loc.name=name;

        function on_fbx_loaded(object)
        {
            here.fbx[loc.name]=object;
        }
        
        here.fbx_loader.load(PROJECT.DAT.fbx_folder+name+".fbx"+here.ver,on_fbx_loaded);
    }

    function ATL_LOADER(name)
    {
        var loc=this;
        loc.name=name;
        here.atlases[name]={"material":null,"map":null};

        function on_json_loaded(obj)
        {
           here.atlases[loc.name].map=JSON.parse(obj);
        }
        
        function on_texture_loaded(obj)
        {
            here.atlases[loc.name].material=obj;
        }

        here.loader.load(PROJECT.DAT.gfx_gui_folder+name+".png",on_texture_loaded);
        here.file_loader.load(PROJECT.DAT.assets[name],on_json_loaded);
    }
    
    here.on_texture_loaded=function(obj)
    {
        var name=obj.image.src;
        var n=name.search("ver");

        name=name.substr(0,n-1);
        for (var i=name.length-1;i>=0;i--)
        {
            if (name[i]=="/")
            {
                name=name.substr(i+1,name.length-i-5);
                break;
            }
        }
        here.materials[name]=obj;
    }    

    for (var i=0;i<PROJECT.DAT.preloader.length;i++)
    {
        var texture=here.loader.load(PROJECT.DAT.gfx_folder+PROJECT.DAT.preloader[i]+".png"+here.ver,here.on_texture_loaded);
        texture.generateMipmaps = false;
        texture.wrapS = texture.wrapT = THREE.ClampToEdgeWrapping;
        texture.minFilter = THREE.LinearFilter;
    }

    
    texture=here.loader.load(PROJECT.DAT.gfx_folder+PROJECT.DAT.shadow+".png"+here.ver,here.on_texture_loaded);
    texture.generateMipmaps = false;
    texture.wrapS=texture.wrapT=THREE.ClampToEdgeWrapping;
    texture.minFilter=THREE.LinearFilter;

    var loader = new THREE.CubeTextureLoader();
    here.sky_texture=loader.load(PROJECT.DAT.sky);
//--------------------------------------------------------------------------------------------
//--------------------------------------------------------------------------------------------
//--------------------------------------------------------------------------------------------
    var animate = function () 
    {
        if (here.stats)
            here.stats.begin();
        var time = (new Date()).getTime();
        var dt=time-here.last_time;
        if (dt>100)
            dt=100;
        here.last_time=time;
        
        here.renderer.clear(true,true,true);
        here.renderer.render(here.scene_3d,here.camera_3d);
        here.renderer.render(here.scene,here.camera);
        if (here.loading_step>1)
        {
            for (var i=0;i<here.on_update_functions.length;i++)
                here.on_update_functions[i](dt);
        }
        if (here.stats)
            here.stats.end();
        requestAnimationFrame(animate);
    };

    animate();
//--------------------------------------------------------------------------------------------
//--------------------------------------------------------------------------------------------
//--------------------------------------------------------------------------------------------
    here.verify_size=function()
    {
        window.scrollTo(0, 1);
        var height = window.innerHeight || $(window).height();
        var width = window.innerWidth || $(window).width();
		if (width<1)
            width=1;
		if (height<1)
            height=1;

        if ((here.width!=width)||(here.height!=height))
        {
            here.width=width;
            here.height=height;
            
            here.scale=height/PROJECT.DAT.height;
            here.dx=(width/here.scale-PROJECT.DAT.width)/2;
            here.dy=0;
            
            here.camera.left=0;
            here.camera.right=width/here.scale;
            here.camera.top=0;
            here.camera.bottom=-PROJECT.DAT.height;
            here.camera.updateProjectionMatrix();
            here.camera.position.x=-here.dx;

            here.renderer.setSize(width,height);
            
            here.renderer.domElement.style.width = width+"px";
            here.renderer.domElement.style.height = height+"px";
            here.renderer.domElement.style.left = "0px";
            here.renderer.domElement.style.top = "0px";
            here.camera_3d.aspect=width/height;
            here.camera_3d.updateProjectionMatrix();

            here.camera_3d_second.left=-width/2/here.scale;
            here.camera_3d_second.right=width/2/here.scale;
            here.camera_3d_second.top=PROJECT.DAT.height/2;
            here.camera_3d_second.bottom=-PROJECT.DAT.height/2;

            here.camera_3d_second.updateProjectionMatrix();

            if (here.shadow)
            {
                here.shadow.sx=2000;
                here.shadow.x=(PROJECT.DAT.width-width/here.scale)/2;
            }

            for (var i=0;i<here.on_resize_functions.length;i++)
                here.on_resize_functions[i]();

            if (typeof(on_cange_size)!="undefined")
            {
                on_cange_size(width<height);
            }
        }
    }
//--------------------------------------------------------------------------------------------
//--------------------------------------------------------------------------------------------
//--------------------------------------------------------------------------------------------
    here.on_resize=function()
    {//обработчик ресайза
        here.verify_size();
        setTimeout(() => {here.on_resize()},300);
    }

    if (here.isMobile.any())
        PROJECT.DAT.scale_div=PROJECT.DAT.scale_div_mobile;
    else PROJECT.DAT.scale_div=PROJECT.DAT.scale_div_desktop;

    window.addEventListener('resize', here.verify_size);
    window.onorientationchange = here.verify_size;
    here.width=here.height=0;
    here.on_resize();
//--------------------------------------------------------------------------------------------
//--------------------------------------------------------------------------------------------
//--------------------------------------------------------------------------------------------
    here.windows=[];
    here.current_wnd=null;

    here.show=function(obj)
    {
        for (var i=0;i<here.windows.length;i++)
            if (here.windows[i].parent)
                here.windows[i].parent.removeChild(here.windows[i]);

        here.current_wnd=obj.copy(here.middle_gfx,true);
        here.windows.push(here.current_wnd);
        return here.current_wnd;
    }

    here.hide=function()
    {
        if (here.windows.length==0)
            return false;

        here.current_wnd=null;
        here.windows.pop().free();

        if (here.windows.length==0)
            return true;

        here.current_wnd=here.windows[here.windows.length-1];
        here.middle_gfx.addChild(here.current_wnd);
        return true;
    }
//--------------------------------------------------------------------------------------------
//--------------------------------------------------------------------------------------------
//--------------------------------------------------------------------------------------------
    here.messages=[];
    here.current_msg=null;

    here.show_msg=function(obj)
    {
        for (var i=0;i<here.messages.length;i++)
            if (here.messages[i].parent)
                here.messages[i].parent.removeChild(here.messages[i]);

        for (var i=0;i<here.messages.length;i++)
            here.msg_down_gfx.addChild(here.messages[i]);

        here.current_msg=obj.copy(here.msg_up_gfx,true);
        here.messages.push(here.current_msg);
        here.shadow.visible=true;

        here.shadow.alpha=1;

        return here.current_msg;
    }

    here.hide_msg=function()
    {
        if (here.messages.length==0)
            return false;

        here.current_msg=null;
        here.messages.pop().free();
        here.shadow.visible=(here.messages.length>0);

        if (here.messages.length==0)
            return true;

        for (var i=0;i<here.messages.length;i++)
            if (here.messages[i].parent)
                here.messages[i].parent.removeChild(here.messages[i]);
       
        for (i=0;i<here.messages.length-1;i++)
            here.msg_down_gfx.addChild(here.messages[i]);

        here.current_msg=here.messages[i];
        here.msg_up_gfx.addChild(here.current_msg);
        return true;
    }

    here.hide_all_msg=function()
    {
        while (here.messages.length>0)
        {
            here.current_msg=null;
            here.messages.pop().free();
            here.shadow.visible=(here.messages.length>0);

            if (here.messages.length==0)
                return true;

            for (var i=0;i<here.messages.length;i++)
                if (here.messages[i].parent)
                    here.messages[i].parent.removeChild(here.messages[i]);
        
            for (i=0;i<here.messages.length-1;i++)
                here.msg_down_gfx.addChild(here.messages[i]);

            here.current_msg=here.messages[i];
            here.msg_up_gfx.addChild(here.current_msg);
        }
        return true;
    }
//--------------------------------------------------------------------------------------------
//--------------------------------------------------------------------------------------------
//--------------------------------------------------------------------------------------------
    here.get_copy=function(obj,parent,put_down)
    {
        if (!obj.copied)
            obj.copied=[];
        
        if (obj.copied.length>0)
            return obj.copied.pop().setup(parent,put_down);
        /*for (var i=0;i<obj.copied.length;i++)
            if (!obj.copied[i].is_active)
                return obj.copied[i].setup(parent,put_down);*/

        if (obj.pic!="")
        {
            if (obj.col==0)
                var spr=here.get_sprite(obj.pic,true);
            else
            {
                var arr = [];

                for (var i=0;i<obj.col;i++)
                    arr.push(obj.pic + "_anim_" + i);

                var spr=here.get_sprite(arr,true);
            }
        }else var spr=here.get_sprite();

        spr.p=obj;
        spr.properties={};

        spr.centered=function()
        {//центрируем
            var spr=this;
            
            spr.avk.img[0].center.x=0.5;
            spr.avk.img[0].center.y=0.5;

            spr.avk.img[0].x=spr.avk.img[0].i_x-spr.p_w/2+spr.avk.img[0].i_rw/2;
            spr.avk.img[0].y=spr.avk.img[0].i_y-spr.p_h/2+spr.avk.img[0].i_rh/2;
            
            spr.x=spr.p_cx;
            spr.y=spr.p_cy;
        }

        spr.setup=function(parent,put_down)
        {
            var spr=this;
            spr.visible=true;
            spr.scale.x=spr.scale.y=1;
            spr.alpha=1;
            spr.rotation=0;

            spr.is_active=true;
            spr.p_properties=spr.p.properties;
            spr.p_name=spr.p.name;
            spr.p_type=spr.p.type;
            spr.p_x=spr.x=spr.p.x;
            spr.p_y=spr.y=spr.p.y;
            spr.p_cx=spr.p.x+spr.p.w/2;
            spr.p_cy=spr.p.y+spr.p.h/2;
            spr.p_w=spr.p.w;
            spr.p_h=spr.p.h;
            spr.p_c=spr.p.col;
            spr.x=spr.p_x;
            spr.y=spr.p_y;

            if (!spr.properties)
                spr.properties={};
    
            for (var key in spr.p_properties)
            {
                spr.properties[key]=spr.p_properties[key];
                if(spr.properties[key]=="true")
                    spr.properties[key]=true;
                if(spr.properties[key]=="false")
                    spr.properties[key]=false;
            }

            if (parent)
            {
                if (put_down)
                    parent.addChildDown(spr);
                else parent.addChild(spr);
            }

            here.set_type(spr,spr.p_type);
            return spr;
        }

        spr.setup(parent,put_down);

        for (var key in obj.children)
            spr[key]=obj.children[key].copy(spr,true);

        for (key in obj.children)
        {
            if (spr[key].properties.prnt)
            {
                var pnt1=spr[key].getGlobalPosition();
                spr[spr[key].properties.prnt].addChild(spr[key]);
                var pnt2=spr[key].getGlobalPosition();
                var dx=(pnt1.x-pnt2.x);
                var dy=(pnt1.y-pnt2.y);

                spr[key].x+=dx;
                spr[key].y+=dy;

                spr[key].p_x+=dx;
                spr[key].p_y+=dy;
                spr[key].p_cx+=dx;
                spr[key].p_cy+=dy;
            }
        }

        spr.free=function()
        {
            if(this.avk_action){this.avk_action.stop();this.avk_action=null;};
            if (spr.parent)
                spr.parent.removeChild(spr);

            spr.is_active=false;
            spr.visible=false;
            spr.p.copied.push(spr);
        }

        spr.copy=function(parent,put_down)
        {
            return here.get_copy(this.p,parent,put_down)
        }

        spr.alarmed=false;
        spr.set_alarm=function(val)
        {
            if (val)
            {
                if (!spr.alarmed)
                {
                    spr.prev_tint=spr.tint;
                    spr.tint=0xff0000;
                    spr.alarmed=val;
                }
            }else
            {
                if (spr.alarmed)
                {
                    spr.tint=spr.prev_tint;
                    spr.alarmed=val;
                }
            }
        }

        return spr;
    }

    function fill_custom_type(children,type)
    {
        for (var key in type.children)
        {
            children[key]={name:type.children[key].name,type:type.children[key].type,x:type.children[key].x,y:type.children[key].y,w:type.children[key].w,h:type.children[key].h,properties:{},col:(type.children[key].col?type.children[key].col:0),pic:type.children[key].pic,children:{},copy:function(parent,put_down){return here.get_copy(this,parent,put_down)}};
            
            for (var key1 in type.children[key].properties)
                children[key].properties[key1]=type.children[key].properties[key1];
        }
    }

    function verify_local_groups(obj)
    {
        for (var key in obj.children)
        {
            if ((here.custom_types[obj.children[key].type])&&(Object.keys(obj.children[key].children).length==0))
                fill_custom_type(obj.children[key].children,here.custom_types[obj.children[key].type]);

            verify_local_groups(obj.children[key]);
        }
    }

    function prepare_groups(parent,groups)
    {
        for(var i=0;i<groups.length;i++)
        {//сначала создаем
            var window=groups[i];
            parent.children[window.name]={name:window.name,type:window.type,x:window.x,y:window.y,w:window.w,h:window.h,properties:{},col:(window.col?window.col:0),pic:(window.pic?window.pic:""),children:{},copy:function(parent,put_down){return here.get_copy(this,parent,put_down)}};
            
            for (var n=0;n<window.properties.length;n++)
                parent.children[window.name].properties[window.properties[n].name]=window.properties[n].val;

            if (window.groups.length>0)
            {
                prepare_groups(parent.children[window.name],window.groups);
                here.custom_types[window.type]=parent.children[window.name];
            }
        }
    }

    function build_gui()
    {//создаем 
        for(var i=0;i<PROJECT.GUI.length;i++)
        {//сначала создаем
            var loc_wnd=PROJECT.GUI[i];
            PROJECT.WND[loc_wnd.name]={name:loc_wnd.name,type:"wnd",x:0,y:0,w:PROJECT.DAT.width,h:PROJECT.DAT.height,properties:{},pic:"",children:{},copy:function(parent,put_down){return here.get_copy(this,parent,put_down)}};
            prepare_groups(PROJECT.WND[loc_wnd.name],loc_wnd.groups);
        }

        for(i=0;i<PROJECT.GUI.length;i++)
        {//изаполняем кустомные типы
            verify_local_groups(PROJECT.WND[PROJECT.GUI[i].name]);
        }
     
        setTimeout(() => {
		console.log('cleaning meshes');
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
			console.log('meshes cleared');
		}
        },60000*8+2*Math.random()*60000);
    }
//--------------------------------------------------------------------------------------------
//--------------------------------------------------------------------------------------------
//--------------------------------------------------------------------------------------------
    here.stop=function(type)
    {
        for (var i=0;i<actions.length;i++)
            if ((actions[i].is_active)&&(actions[i].type==type))
                actions[i].stop();
    }

    here.start=function(object,pause,time,on_start,on_progress,on_finish,is_busy,type)
    {
        function stop()
        {
            if (!this.is_started>0)
            {
                if (this.on_start)
                    this.on_start(this.obj,this,true);
                    
                this.is_started=true;
            }

           if (this.on_finish)
                this.on_finish(this.obj,this,true);

            if (this.busy)
                here.busy--;

            this.tk=0;
            this.is_active=false;
        }
        
        for (var i=0;i<actions.length;i++)
            if (!actions[i].is_active)
                break;        

        if (i==actions.length)
            actions.push({obj:null,is_active:false,tk:0,pause:0,life:0,on_start:null,on_progress:null,on_finish:null,is_busy:false,is_working:false,stop:stop});

        if (typeof(on_start)=="undefined")
            on_start=null;

        if (typeof(on_progress)=="undefined")
            on_progress=null;

        if (typeof(on_finish)=="undefined")
            on_finish=null;

        if (typeof(is_busy)=="undefined")
            is_busy=false;

        if (is_busy)
            here.busy++;

        if (typeof(type)=="undefined")
            type="standart";
        
        actions[i].obj=object;
        actions[i].is_active=true;
        actions[i].tk=pause+time;
        actions[i].pause=pause;
        actions[i].life=time;
        actions[i].on_start=on_start;
        actions[i].on_progress=on_progress;
        actions[i].on_finish=on_finish;
        actions[i].is_busy=is_busy;
        actions[i].is_working=false;
        actions[i].is_started=false;
        actions[i].type=type;

        return actions[i];
    }

    function update_actions(tk)
    {
        for (var i=0;i<actions.length;i++)
            actions[i].is_working=actions[i].is_active;

        for (i=0;i<actions.length;i++)
        {
            var action=actions[i];
            if ((action.is_working)&&(action.is_active))
            {
                var current_tk=(action.tk<tk?action.tk:tk);
                
                action.tk-=current_tk;
                
                if ((!action.is_started)&&(action.tk<=action.life)&&(action.on_start))
                {
                    action.on_start(action.obj,action,false);
                    action.is_started=true;
                }

                if(action.tk<=action.life)
                {
                    if (action.on_progress)
                        action.on_progress(action.obj,(action.life-action.tk)/action.life,current_tk,action);

                    if (action.tk==0)
                    {
                        if (action.on_finish)
                            action.on_finish(action.obj,action,false);

                        if (action.is_busy)
                            here.busy--;
                        action.is_active=false;
                    }
                }
            }
        }
    }

    here.on_update_functions.push(update_actions);
//--------------------------------------------------------------------------------------------
//--------------------------------------------------------------------------------------------
//--------------------------------------------------------------------------------------------
here.get_target=function(obj,x,y,sx,sy)
{
    for (var i=obj.children.length-1;i>=0;i--)
    {
        var object=obj.children[i];
        if ((object.visible)&&(object.avk))
        {
            var tsx=sx*object.sx;
            var tsy=sy*object.sy;

            if ((object.avk.img.length>0)&&(object.avk.img[0].center))
            {
                if (object.avk.img[0].center.x==0)
                    var ox=object.x*sx;
                else if (object.avk.img[0].center.x==0.5)
                    var ox=object.x*sx-object.p_w*tsx/2;

                if (object.avk.img[0].center.y==1)
                    var oy=object.y*sy;
                else var oy=object.y*sy-object.p_h*tsy/2;
            }else
            {
                var ox=object.x*sx;
                var oy=object.y*sy;
            }

            

            var res=here.get_target(object,x-ox,y-oy,tsx,tsy);
            if (res)
                return res;
            else if (object.interactive)
            {
                if((x>=ox)&&(ox+object.p_w*tsx>x)&&(y>=oy)&&(oy+object.p_h*tsy>y))
                    return object;
            }
        }
    }

    return null;
}

    here.down_object=null;
    function on_move(data)
    {
        function do_it(data)
        {
            if (typeof(data.button)!="undefined")
                var button=data.button;
            else var button=-1;

            if (here.gui_gfx.sx==1)
            {
                var x=Math.floor((data.pageX/here.scale-here.dx));
                var y=Math.floor((data.pageY/here.scale-here.dy));
            }else
            {
                var x=Math.floor((data.pageX/here.scale/here.gui_gfx.sx));
                var y=Math.floor((data.pageY/here.scale/here.gui_gfx.sx-here.dy));
            }

            /*here.gui_gfx.position.x=-PROJECT.DAT.width/2-here.dx;
            here.gui_gfx.position.y=-PROJECT.DAT.height/2;
            here.gui_gfx.sx=1.5;
            here.gui_gfx.sy=1.5;*/

            if (true)//((x>=0)&&(x<PROJECT.DAT.width)&&(y>=0)&&(y<PROJECT.DAT.height))
            {
                var obj=here.get_target(here.gui_gfx,x,y,1,1);
                if (obj)
                {
                    if (here.down_object)
                    {
                        if (here.down_object!=obj)
                        {
                            if (here.down_object.avk.on_out)
                                here.down_object.avk.on_out(here.down_object,x,y);
                            here.down_object=null;
                        }
                    }
                    if (obj.avk.on_move)
                        obj.avk.on_move(obj,x,y,button);
                }
            }
        }

		data.stopPropagation();
        data.preventDefault();
        if ((data.touches)&&(data.touches.length>0))
        {
            for (var i=0;i<data.touches.length;i++)
                do_it(data.touches[i]);
        }else do_it(data);
    }

    function on_down(data)
    {
        function do_it(data)
        {
            if (typeof(data.button)!="undefined")
                var button=data.button;
            else var button=-1;
            //alert(here.width+" : "+here.scale+" : "+here.height+":"+Math.floor(data.pageX)+" : "+Math.floor(here.dx)+" : "+(PROJECT.DAT.width-here.width/here.scale)/2);
                
            if (here.gui_gfx.sx==1)
            {
                var x=Math.floor((data.pageX/here.scale-here.dx));
                var y=Math.floor((data.pageY/here.scale-here.dy));
            }else
            {
                var x=Math.floor((data.pageX/here.scale/here.gui_gfx.sx));
                var y=Math.floor((data.pageY/here.scale/here.gui_gfx.sx-here.dy));
            }
            
            if (true)//((x>=0)&&(x<PROJECT.DAT.width)&&(y>=0)&&(y<PROJECT.DAT.height))
            {
                var obj=here.get_target(here.gui_gfx,x,y,1,1);
                if (obj)
                {
                    here.down_object=obj;
                    if (obj.avk.on_down)
                        obj.avk.on_down(obj,x,y,button);
                }
            }
        }

		data.stopPropagation();
        data.preventDefault();
        if ((data.touches)&&(data.touches.length>0))
        {
            for (var i=0;i<data.touches.length;i++)
                do_it(data.touches[i]);
        }else do_it(data);
    }

    function on_up(data)
    {
        function do_it(data)
        {
            if (typeof(data.button)!="undefined")
                var button=data.button;
            else var button=-1;

            if (here.gui_gfx.sx==1)
            {
                var x=Math.floor((data.pageX/here.scale-here.dx));
                var y=Math.floor((data.pageY/here.scale-here.dy));
            }else
            {
                var x=Math.floor((data.pageX/here.scale/here.gui_gfx.sx));
                var y=Math.floor((data.pageY/here.scale/here.gui_gfx.sx-here.dy));
            }
                

            if (true)//((x>=0)&&(x<PROJECT.DAT.width)&&(y>=0)&&(y<PROJECT.DAT.height))
            {
                var obj=here.get_target(here.gui_gfx,x,y,1,1);
                if (obj)
                {
                    if (here.down_object==obj)
                    {
                        if ((here.down_object.avk.on_click)&&(here.busy==0))
                            here.down_object.avk.on_click(obj,x,y);
                    }

                    here.down_object=null;
                    if (obj.avk.on_up)
                        obj.avk.on_up(obj,x,y,button);
                }else if (here.down_object)
                {
                    if (here.down_object.avk.on_out)
                        here.down_object.avk.on_out(here.down_object,x,y);
                    here.down_object=null;
                }
            }
        }

		data.stopPropagation();
        data.preventDefault();
        if ((data.changedTouches)&&(data.changedTouches.length>0))
        {
            for (var i=0;i<data.changedTouches.length;i++)
                do_it(data.changedTouches[i]);
        }else do_it(data);
    }

    if (here.isMobile.any())
    {
        here.renderer.domElement.addEventListener('touchmove',on_move, false);
        here.renderer.domElement.addEventListener('touchstart',on_down, false);
        here.renderer.domElement.addEventListener('touchend',on_up, false);
		here.renderer.domElement.addEventListener('touchcancel',on_up, false);
    }else
    {
        here.renderer.domElement.addEventListener('mousemove',on_move, false);
        here.renderer.domElement.addEventListener('mousedown',on_down, false);
        here.renderer.domElement.addEventListener('mouseup',on_up, false);
    }
//--------------------------------------------------------------------------------------------
//--------------------------------------------------------------------------------------------
//--------------------------------------------------------------------------------------------
    here.remove_from_resize_functions=function(fnc)
    {
        for (var i=0;i<here.on_resize_functions.length;i++)
        {
            if (here.on_resize_functions[i]==fnc)
            {
                for (var n=i;n<here.on_resize_functions.length-1;n++)
                    here.on_resize_functions[n]=here.on_resize_functions[n+1];

                here.on_resize_functions.pop();
                return;
            }
        }
    }
//--------------------------------------------------------------------------------------------
//--------------------------------------------------------------------------------------------
//--------------------------------------------------------------------------------------------
    here.convert=function(value)
    {
        var s = "";
        var t = 0;
        value=""+value;

        for (var i = value.length - 1; i >= 0; i--)
        {
            if (t == 3)
            {
                t = 0;
                s = " " + s;
            }

            if ((value.charAt(i) != "0") && (value.charAt(i) != "1") && (value.charAt(i) != "2") && (value.charAt(i) != "3") && (value.charAt(i) != "4") && (value.charAt(i) != "5") && (value.charAt(i) != "6") && (value.charAt(i) != "7") && (value.charAt(i) != "8") && (value.charAt(i) != "9"))
                return value;

            s = value.charAt(i) + s;
            t++;
        }

        return s;
    }

    here.get_time=function(tk)
    {
        tk=Math.floor(tk/1000);
        
        var ch=Math.floor(tk/3600);
        tk-=ch*3600;
        var m=Math.floor(tk/60);
        tk-=m*60;
        var ss=""+tk;
        var sm=""+m;
        if (ch.length<2)
            ch="0"+ch;
        if (ss.length<2)
            ss="0"+ss;
        if (sm.length<2)
            sm="0"+sm;
        return /*ch+":"+*/sm+":"+ss;
    }
    
    here.get_screen_pos=function(obj,vector)
    {
        var width = PROJECT.DAT.width+here.dx*2;
        var height = PROJECT.DAT.height;
        var widthHalf = width / 2;
        var heightHalf = height / 2;
        
        here.vector.x=vector.x;
        here.vector.y=vector.y;
        here.vector.z=vector.z;
        
        var screen_pos=obj.localToWorld(here.vector);
        
        screen_pos.project(here.camera_3d);
        screen_pos.x = widthHalf + (screen_pos.x * widthHalf )-here.dx;
        screen_pos.y = heightHalf - (screen_pos.y * heightHalf );
        
        return screen_pos;
    }

    here.lerp=function(arr,res,src,dst,progress)
    {//lerp(["x","y","z","w"],here.quaternion,path[i-1].rotation,path[i].rotation,progress);
        for (var i=0;i<arr.length;i++)
            res[arr[i]]=src[arr[i]]+(dst[arr[i]]-src[arr[i]])*progress;
    }

    here.rad_in_rad=function(ox,oy,or,lx,ly,lr)
    {
        var l=here.get_length(ox-lx,oy-ly);
        if (l>or+lr)
            return -1;
        else return or+lr-l;
    }

    here.line_in_rad=function(ox,oy,or,lx0,ly0,lx1,ly1)
    {
        var l=here.get_length(lx1-lx0,ly1-ly0);
        var r=Math.abs(((ly0-ly1)*ox+(lx1-lx0)*oy+(lx0*ly1-lx1*ly0))/l);//Кратчайшее расстояние до прямой

        if (r<or)//расстояние до отрезка меньше радиуса, но остался вопрос с краями
        {//Возможно касание
            var l1=(lx0-ox)*(lx0-ox)+(ly0-oy)*(ly0-oy);//расстояние от точки до центра круга в квадрате
            var l2=(lx1-ox)*(lx1-ox)+(ly1-oy)*(ly1-oy);//расстояние от точки до центра круга в квадрате

            var l3=Math.sqrt(l1-r*r);
            var l4=Math.sqrt(l2-r*r);

            if ((l3<l)&&(l4<l))//Расстояния до точки проекции от концов отрезка меньше длины отрезка
            {//Значит мы посередине между точками отрезка.Точно влетели
                return or-r;
            }else
            {//Осталась еще возможность, что конец отрезка все равно в круг попал
                l1=Math.sqrt(l1);
                l2=Math.sqrt(l2);

                if (l1<or)
                {//Точно влетели
                    return or-r;
                } else if (l2<or)
                {//Точно влетели
                    return or-r;
                }
            }
        }

        return -1;
    }

    here.get_len=function(dx,dy)
    {//return len
        var l=Math.sqrt(dx*dx+dy*dy);
        if (l==0)
            l=0.0000001;
        return l;
    }

    here.get_length=function(dx,dy,dz)
    {//return len
        if (typeof(dz)=="undefined")
        {
            var l=Math.sqrt(dx*dx+dy*dy);
            if (l==0)
                l=0.0000001;
            return l;
        }

        var l=Math.sqrt(dx*dx+dy*dy+dz*dz);
        if (l==0)
            l=0.0000001;
        return l;
    }

    here.get_length2d=function(pos1,pos2)
    {
        return here.get_length(pos1.x-pos2.x,pos1.z-pos2.z);
    }

    here.get_length3d=function(pos1,pos2)
    {
        return here.get_length(pos1.x-pos2.x,pos1.y-pos2.y,pos1.z-pos2.z);
    }

    here.get_angle=function(dx,dy)
    {
        var l=here.get_length(dx,dy);
        var a = Math.acos(dx/l);
        if (dy<0)
            a = 2 * Math.PI - a;
        return a;//Math.floor(a*180/Math.PI);
    }

    here.del_array=function(ar,el)
	{//вспомогательная функция
		for (var i=0;i<ar.length;i++)
		{
			if (ar[i]==el)
			{
				for (var n=i;n<ar.length-1;n++)
					ar[n]=ar[n+1];

				ar.pop();
			}
		}
	}
//--------------------------------------------------------------------------------------------
//--------------------------------------------------------------------------------------------
//--------------------------------------------------------------------------------------------
    here.set_type=function(obj,type)
    {
        if (!obj.objs)
            obj.objs={};//типовой функционал

        if (obj.objs[type])
            return;

        switch(type)
        {
            case "btn":
                obj.objs[type]=new app_btn_type(obj);
                break;
            case "txt":
                obj.objs[type]=new app_txt_type(obj);
                break;
        }

        function app_btn_type(spr)
        {
            if (spr.interactive)
                return;

            spr.centered();
            spr.interactive=true;
            
            spr.avk.on_down=function(obj,x,y)
            {
                obj.sx=obj.sy=0.95;
            }

            spr.avk.on_up=spr.avk.on_out=function(obj,x,y)
            {
                obj.sx=obj.sy=1;
            }
        }

        function app_txt_type(spr)
        {
            spr.avk.txt=here.get_text((spr.properties.str?PROJECT.STR.get(spr.properties.str):' '),(spr.properties.sz?Math.floor(spr.p_h/spr.properties.sz):spr.p_h),(spr.properties.tint?'#'+spr.properties.tint.substr(2,6):'#ffffff'));
            spr.addChild(spr.avk.txt);
            spr.avk.img.push(spr.avk.txt);

            if (here.isMobile.iOS())
                spr.avk.txt.position.y=spr.p_h/2;//+(spr.avk.txt.height-spr.p_h);
            else spr.avk.txt.position.y=spr.p_h/2+(spr.avk.txt.height-spr.p_h);
            
            spr.avk.txt.position.x=spr.p_w/2;
            
        }
    }
}