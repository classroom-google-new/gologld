PROJECT.MAIN=function()
{//после чтения всего кода js мы вызываем этот конструктор
    var here=this;

    function start_game()
    {//реальный старт игры
	console.log('main - startgame');
        PROJECT.GAME.MAIN.before_show(begin_game);
    }

    function begin_game()
    {//реальный старт игры
	console.log('main - begingame');
        //here.app.scene_3d.background=here.app.sky_texture[0];
        PROJECT.PRELOADER.hide(PROJECT.GAME.MAIN.start_game);//скрываем прелоадер и стартуем игру
    }

    function on_loaded()
    {//начинаем работу после загрузки всех ассетов
	console.log('main - onloaded');
        PROJECT.GAME.MAIN=new PROJECT.PRT.MAIN(here.app);//создаем все объекты игры
        PROJECT.STR.init(start_game);
    }

    function getCurrentLanguage()
    {
        var userLang = navigator.language || navigator.userLanguage; 
        return PROJECT.STR.get_lng(userLang.substr(0,2));
    }

    if (WEBGL.isWebGLAvailable())
    {
        if (typeof(getCurrentLanguage)!="undefined")
            PROJECT.STR.lng=getCurrentLanguage();


        WebFont.load(
            {
                active:function()
                {
                    for (var i=0;i<PROJECT.DAT.fonts.length;i++)
                    {
                        var el = document.createElement('tmp_txt'+i);
                        el.style.fontFamily = PROJECT.DAT.fonts[i];
                        el.style.fontSize = "1px";
                        el.style.visibility = "hidden";
                        el.innerHTML = '.1FА';
                        document.body.appendChild(el);
                    }        
                        
                    here.app=PROJECT.APP=new PROJECT.APP(on_loaded);//считываем ассеты
                },
                google: 
                {
                    families:PROJECT.DAT.fonts
                }
            });
        
    }else
    {
        var warning = WEBGL.getWebGLErrorMessage();
        document.body.appendChild(warning);
    }
}