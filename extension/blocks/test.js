const loc = location.href;
const LetragonLoc = "http://letragon.ru";

jQuery(document).ready(function($) {

    // Проверка новых версий расширения.
    const ExtensionVersion = "1.2.6.14";
    let ExtensionLastVersion = "",
    UStyleName = "",
    UStyleVersion = "",
    UStyleLastVersion = "",
    iHaveGuild = Boolean($('.nav-sectionLeft a[href^="/guild/"]').length)? $('.nav-sectionLeft a[href^="/guild/"]').attr('href'):0,
    JN;
    $('body').append("<div id='TEST' style='display:none'></div>").find('#TEST').load('//dangarte.github.io/Letragon/extension/info.json', function() {
        if($(this).text()) {
            JN = JSON.parse($(this).text());
            ExtensionLastVersion = JN['last-version'];
            if(!loc.startsWith('http://letragon.ru/user/') && $('#custom-css-senpai').text().includes('/*"info":')) {
                let Ua = $('#custom-css-senpai').text().indexOf('/*"info":') + ('/*"info":').length, Ub = $('#custom-css-senpai').text().indexOf('}*/', Ua),
                ST = JSON.parse($('#custom-css-senpai').text().substr(Ua, Ub - Ua) + '}');
                UStyleName = ST.name;
                UStyleVersion = ST.version;
                UStyleCreator = ST.creator;
                UStyleLastVersion = JN['last-css-version'][UStyleName];
                if(UStyleLastVersion && !ChecKversions(UStyleVersion, UStyleLastVersion)) {
                    senpaiNotice('info', 'Стили', 'Происходит обновление стиля <span style="color:gold">' + UStyleName + '</span> до <span style="color:gold">v' + UStyleLastVersion + '</span>');
                    SetStyle(UStyleName);
                }
            }
            let ExtensionLink = "//dangarte.github.io/Letragon/extension/Letragon+_v" + ExtensionLastVersion + ".crx";
            // Проверка версии: true - последняя версия, false - версия устарела.
            function ChecKversions(a, b) {
                let v = a.split('.');
                let lv = b.split('.');
                if(v.length == lv.length) {
                    for(let i = 0; i < v.length; i++) {
                        if(Number(lv[i]) > Number(v[i])) {
                            return false;
                        }
                    }
                    return true;
                }
                else {
                    return false;
                }
            }
            if(!ChecKversions(ExtensionVersion, ExtensionLastVersion)) {
                let t = $('body').append('<div id="LoadingChangelod" style="display:none"></div>').find('#LoadingChangelod');
                t.load('//dangarte.github.io/Letragon/extension/changelog.json', function() {
                    let changelist = '';
                    let changelog = JSON.parse(t.text())['changelog'];
                    for(let i = changelog.findIndex(el => el.version == ExtensionVersion) + 1; i < changelog.length; i++) {
                        changelist += '<ul>' + changelog[i].version;
                        let c = changelog[i].desc.split(';');
                        c.forEach(el => changelist +='<li>' + el.split(',').join(', ') + '</li>');
                        changelist += '</ul>';
                    }
                    t.remove();
                    consoleNotice('Новая версия', 'Letragon+ v' + ExtensionLastVersion, 'https:' + ExtensionLink, 'green');
                    AddLink('Новая версия <span style=\'color:gold\'>v' + ExtensionLastVersion + '</span><br>Что нового?<br>' + changelist);
                });
            }
            function AddLink(text) {
                $('.navbar .nav-sectionLeft').append('<div class="nav-menuItem nav-item lilpipe" data-text="<div style=\'color:#d4d4d4;padding:20px;font-size:1.2em;\'><div style=\'position:absolute;left:0;top:0;width:100%;height:100%;opacity:.4;z-index:-1;background: black url(//dangarte.github.io/Letragon/Malum.png) no-repeat center / contain;filter:blur(4px)\'></div>' + text + '</div>"><a href="' + ExtensionLink + '">Обновить расширение</a></div>');
            }
            if(localStorage.getItem("ShowNotification") ? Boolean(Number(localStorage.getItem("ShowNotification"))) : true) {
                if(JN.notification && JN.notification.head != "") {
                    senpaiNotice('info', JN.notification.head, JN.notification.desc);
                    consoleNotice('Информация!', JN.notification.head, JN.notification.desc);
                    localStorage.setItem("ShowNotification", 0);
                }
                else localStorage.setItem("ShowNotification", 1);
            }
            else if(JN.notification && JN.notification.head != "") consoleNotice('Информация!', JN.notification.head, JN.notification.desc); else localStorage.setItem("ShowNotification", 1);
        }
        
    }).remove();
    // Модуль Проверки стилей.
    let CheckStyle = localStorage.getItem("CheckStyle") ? Boolean(Number(localStorage.getItem("CheckStyle"))) : false;
    // Отображение репутации на странице гильдии.
    let CheckRep = localStorage.getItem("CheckRep") ? Boolean(Number(localStorage.getItem("CheckRep"))) : true;
    // Правка таймеров в Лавочке Виз.
    let WizTimers = localStorage.getItem("WizTimers") ? Boolean(Number(localStorage.getItem("WizTimers"))) : true;
    // Проверка кол-ва участников гильдий.
    let GuildmembersCount = localStorage.getItem("GuildmembersCount") ? Boolean(Number(localStorage.getItem("GuildmembersCount"))) : true;
    // Показывать статистику достижений.
    let ShowAchStat = localStorage.getItem("ShowAchStat") ? Boolean(Number(localStorage.getItem("ShowAchStat"))) : false;
    // Через сколько часов обновлять список проверенных стилей игроков.
    let TimeToReloadStyle = 24;

    // Улучшения для Лавочки Виз.
    if(loc.startsWith(LetragonLoc + "/wiz-store")) {
        /* Сортировка контрактов и подсчет цен */ {
            // 1й Кусок для вывода сумм
            let RepS = 0, RepSF = 0,
            PowerS = 0, PowerSF = 0,
            MoneyS = 0, MoneySF = 0,
            TimeS = 0, TimeSF = 0,

            mas = [],
            Elist = $(".tab-pane[data-id='3'] .wiz-quest-block").toArray(),
            Ereps = $(".qI:nth-child(1)", Elist).toArray(),
            Emoneys = $(".qI:nth-child(2)", Elist).toArray(),
            Epowers = $(".qI:nth-child(3)", Elist).toArray();
            count_wiz = Ereps.length,
            Creps = [], Cmoneys = [];
            for(let i = 0; i < count_wiz; i++) {
                let rep = Ereps[i].innerText.split(" ")[0],
                money = Emoneys[i].innerText.split(" ")[0],
                power = Epowers[i].innerText.split(" ")[0],
                Cmoney = (power/money).toFixed(1),
                Crep = (power/rep).toFixed(1),
                Wizlilpipe = "<div style='display:grid;grid-template-columns:repeat(2,1fr);grid-gap:4px'><div>1 Репутация</div><div>: " + power + " / " + rep + " = " + Crep + "</div><div>1 Монета</div><div>: " + power + " / " + money + " = " + Cmoney + "</div></div>";
                $(".wiz-quest-block:nth-child(" + (i + 1) + ") .quest-info h1").append("<span style='color:gray' class='lilpipe' data-text=\"" + Wizlilpipe + "\"> (<span class='wiz-quest-cost Crep'>" + Crep + "</span>|<span class='wiz-quest-cost Cmoney'>" + Cmoney + "</span>)</span>");
                Creps[i] = Crep;
                Cmoneys[i] = Cmoney;

                // 2й Кусок для вывода сумм
                RepSF += Number(rep);
                PowerSF += Number(power);
                MoneySF += Number(money);
                TimeSF += TimeStrTOTimeInt($('.wiz-quest-block:nth-child(' + Number(i + 1) + ') h1>span:not([class][style])').text());
                if(Elist[i].getAttribute('style') == null || Elist[i].getAttribute('style') == "opacity:1") {
                    RepS += Number(rep);
                    MoneyS += Number(money);
                    if(Elist[i].getAttribute('style') != "opacity:1") 
                        PowerS += Number(power);    
                    TimeS += TimeStrTOTimeInt($('.wiz-quest-block:nth-child(' + Number(i + 1) + ') h1>span:not([class][style])').text());
                }

            }
            $('.wiz-quest-cost').css('color', 'darkgoldenrod');

            // 3й Кусок для вывода сумм
            let PowerNow = Number($('.count-dark-points>span').first().text()),
            TimeToUpd = TimeStrTOTimeInt($('.tab-pane[data-id="3"]>h3').text()),
            TimeToUpdTrade = TimeStrTOTimeInt(wiz_start_time = $('.tab-content[data-type="1"]>.tab-pane[data-id="1"]>.panel-start-wiz:first-child()>p').text().split(', ')[1]),
            TTUPD = 0,
            TimeToUpdC = TimeToUpd;
            if(TimeToUpdC > TimeToUpdTrade) {
                TimeToUpdC -= TimeToUpdTrade;
                TTUPD = 1;
            }
            let PowerMaxMax = (Math.floor(TimeToUpdC/53820) + TTUPD) * 75,
            PowerMaxMin = (Math.floor(TimeToUpdC/58500) + TTUPD) * 75,
            infotext = "<ul>Можно получить за все оставшиеся контракты:<li>репутация - " + RepS + " <span style='opacity:.4'>(всего: " + RepSF + ")</span></li><li>монеты - " + MoneyS + " <span style='opacity:.4'>(всего: " + MoneySF + ")</span></li><li>сила тьмы - " + PowerS + " <span style='opacity:.4'>(80%: " + Math.floor(PowerS*.8) + ") (всего: " + PowerSF + "; 80%: " + Math.floor(PowerSF*.8) + ")</span></li><li>время - " + TimeIntToStr(TimeS, false) + " <span style='opacity:.4'>(всего: " + TimeIntToStr(TimeSF, false) + ") (осталось: " + TimeIntToStr(TimeToUpd, false) + ")</span></li><br><li>Максимально возможное кол-во сил тьмы <span style='opacity:.4'>(используя Синтезированный Кусь)</span> за оставшееся время <span style='opacity:.4'>(" + TimeIntToStr(TimeToUpd, false) + ")</span>: " + PowerNow + " + " + PowerMaxMin + "-" + PowerMaxMax + "; + непонятное N</li></ul>";
            $('.tab-pane[data-id="3"]>h1').append('<span class="lilpipe" id="InfoQuestWiz" style="opacity:.5;cursor:default"> [?] </span>').find('#InfoQuestWiz').attr('data-text', infotext);
            
            for(let i = 0; i < count_wiz; i++) {
                mas[i] = {id: i, rep: Creps[i], money: Cmoneys[i]};
            }

            // Добавление кнопки сортировки
            $(".tab-pane[data-id='3']>h1").append("<div id='wiz-sort' class='pre-settings' style='margin-right:5px;user-select:none' state='1'>Нет сортировки</div>");
            $(".wiz-quest-panel>.u-margin-bottom-sm").remove();
            $("#wiz-sort[state]").click(function(){TSort($(this).attr("state"))});

            // Сортировка по репутации или монетам заданий в лавочке виз
            function TSort(a = 0) {
                $('.wiz-quest-cost').css('opacity', '');
                switch(a) {
                    // Сортировка по репутации
                    case '1': {
                        $("#wiz-sort").text("По репутации").attr("state", 2);
                        mas.sort(function(a, b) {return (a.rep - b.rep == 0) ? a.money - b.money : a.rep - b.rep});
                        $('.Cmoney').css('opacity', '.4');
                        break;
                    } 
                    // Сортировка по монетам
                    case '2': {
                        $("#wiz-sort").text("По монетам").attr("state", 0);
                        mas.sort(function(a, b) {return (a.money - b.money == 0) ? a.rep - b.rep : a.money - b.money});
                        $('.Crep').css('opacity', '.4');
                        break;
                    }
                    // Убрать сортировку
                    default: {
                        $("#wiz-sort").text("Нет сортировки").attr("state", 1);
                        mas.sort(function(a, b) {return a.id - b.id});
                        break;
                    } 
                }
                // Вывод результат сортировки
                for(var i = 0; i < count_wiz; i++)
                    $(".tab-pane[data-id='3']>.wiz-quest-panel").append(Elist[mas[i].id]);
            }
        }    

        // Таймеры.
        if(WizTimers) {
            // Таймер на кнопке уничтожения
            wiz_hunters();
            function wiz_hunters() {
                $('.tab-pane[data-id="9"] .wiz-hunters-but').ready(function() {
                    $('.tab-pane[data-id="9"] .wiz-hunters-but').one("DOMNodeInserted", wiz_hunters);
                    let TimeStr = $('.tab-pane[data-id="9"] .wiz-hunters-but:not(:is([style="display:none"],[style="display: none;"]))>p').text();
                    if(TimeStr.startsWith('Осталось ')) {
                        $('.tab-pane[data-id="9"] .wiz-hunters-but').off("DOMNodeInserted");
                        let hunting_id = $('.tab-pane[data-id="9"] .card-wiz-panel-dungeon.active').attr('data-id');
                        let TimeEnd = TimeStrTOTimeInt(TimeStr),
                        TimeLeft = TimeEnd,
                        TimerId = setInterval(() => tick(), 1000);
                        setTimeout(() => { clearInterval(TimerId); {
                            $('.tab-pane[data-id="9"] .wiz-hunters-but>p').text("Получить награду");
                            $('.tab-pane[data-id="9"] .wiz-hunters-but').attr('style', '');
                            $('.tab-pane[data-id="9"] .card-wiz-panel-dungeon[data-id="' +  hunting_id + '"] span').text("Можно забрать");
                            $('.tab-pane[data-id="9"] .tab-pane[data-id="' +  hunting_id + '"] .wiz-dungeon-block').addClass("quest-act");
                            $('.tab-pane[data-id="9"] .wiz-hunters-but').one("DOMNodeInserted", wiz_hunters);
                        }}, TimeEnd * 1000);
                        function tick() {
                            TimeLeft--;
                            $('.tab-pane[data-id="9"] .wiz-hunters-but>p').text("Осталось " + TimeIntToStr(TimeLeft));
                            $('.tab-pane[data-id="9"] .card-wiz-panel-dungeon[data-id="' +  hunting_id + '"] span').text(TimeIntToStr(TimeLeft));
                        }
                    }
                });
            }

            // Таймер на кнопке контрактов
            let wiz_quest_buts = $('.tab-pane[data-id="3"] .wiz-quest-but').toArray();
            for(let i = 0; i<wiz_quest_buts.length; i++) {
                if(wiz_quest_buts[i].innerText.startsWith('Осталось ')) {
                    let TimeEnd = TimeStrTOTimeInt(wiz_quest_buts[i].innerText),
                    TimeLeft = TimeEnd,
                    TimerId = setInterval(() => tick(), 1000),
                    quest_block_jr = '.tab-pane[data-id="3"] .wiz-quest-block:nth-child(' + Number(i+1) + ')';
                    setTimeout(() => { clearInterval(TimerId);{
                        $(quest_block_jr + '>.wiz-quest-but').text("Забрать награду").attr('data-id', $(quest_block_jr).attr('data-id')).attr('style', '');
                        $(quest_block_jr).addClass("quest-act");
                    }}, TimeEnd * 1000);
                    function tick() {
                        TimeLeft--;
                        $(quest_block_jr + '>.wiz-quest-but').text("Осталось " + TimeIntToStr(TimeLeft));
                    }
                }
            }

            // Таймер на кнопке подземелий
            let wiz_dungeon_buts = $('.tab-pane[data-id="6"] .card-wiz-panel-dungeon p>span').toArray();
            for(let i = 0; i<wiz_dungeon_buts.length; i++) {
                if(parseInt(wiz_dungeon_buts[i].innerText)) {
                    let nth_child = Number(i+1),
                    TimeEnd = TimeStrTOTimeInt(wiz_dungeon_buts[i].innerText),
                    TimeLeft = TimeEnd,
                    TimerId = setInterval(() => tick(), 1000);
                    setTimeout(() => { clearInterval(TimerId); {
                        $('.tab-pane[data-id="6"] .card-wiz-panel-dungeon:nth-child(' + nth_child + ') p>span').text("Можно забрать");
                        $('.tab-pane[data-id="6"] .tab-pane:nth-child(' + nth_child + ') .wiz-dungeon-but>p').text("Забрать награду").attr('style', '');
                        $('.tab-pane[data-id="6"] .tab-pane:nth-child(' + nth_child + ')>.wiz-dungeon-block').addClass('quest-act');
                    }}, TimeEnd * 1000);
                    function tick() {
                        TimeLeft--;
                        $('.tab-pane[data-id="6"] .card-wiz-panel-dungeon:nth-child(' + nth_child + ') p>span').text(TimeIntToStr(TimeLeft));
                        $('.tab-pane[data-id="6"] .tab-pane:nth-child(' + nth_child + ') .wiz-dungeon-but>p').text("Осталось " + TimeIntToStr(TimeLeft));
                    }
                }
            }

            // Таймер обмена
            wiz_start();
            function wiz_start() {
                let wiz_start_time = $('.tab-content[data-type="1"]>.tab-pane[data-id="1"]>.panel-start-wiz:first-child()>p').text().split(', '),
                TimeStr = wiz_start_time[1],
                SubStr = wiz_start_time[0],
                TimeEnd = TimeStrTOTimeInt(TimeStr),
                TimeLeft = TimeEnd,
                TimerId = setInterval(() => tick(), 1000);
                setTimeout(() => { clearInterval(TimerId); $('.tab-content[data-type="1"]>.tab-pane[data-id="1"]>.panel-start-wiz:first-child()>p').text("Обмен завершён, самое время забрать предметы в игре.")}, TimeEnd * 1000);
                function tick() {
                    TimeLeft--;
                    $('.tab-content[data-type="1"]>.tab-pane[data-id="1"]>.panel-start-wiz:first-child()>p').text(SubStr + ", остаётся " + TimeIntToStr(TimeLeft) + ".");
                }
            }

            // Таймер закупки
            wiz_shop();
            function wiz_shop() {
                let wiz_shop_time = $('.tab-content[data-type="1"]>.tab-pane[data-id="1"]>.double-panel-wiz>.panel-start-wiz:nth-child(2)>p').text().split('. '),
                TimeStr = wiz_shop_time[3],
                SubStr = wiz_shop_time[0] + ". " + wiz_shop_time[1] + ". " + wiz_shop_time[2] + ". ",
                TimeEnd = TimeStrTOTimeInt(TimeStr),
                TimeLeft = TimeEnd;
                $('.tab-content[data-type="1"]>.tab-pane[data-id="1"]>.double-panel-wiz>.panel-start-wiz:nth-child(2)>p').text(SubStr).append('<span id="wiz_shop_time" style="opacity:.8">Обновление через' + TimeIntToStr(TimeLeft) + '</span>')
                let TimerId = setInterval(() => tick(), 1000);
                setTimeout(() => { clearInterval(TimerId); $('#wiz_shop_time').text("Обнови страницу что бы увидеть новые товары.")}, TimeEnd * 1000);
                function tick() {
                    TimeLeft--;
                    $('#wiz_shop_time').text("Обновление через " + TimeIntToStr(TimeLeft) + ".");
                    }
            }

            // Таймер обновления контрактов
            wiz_upd();
            function wiz_upd() {
                let wiz_upd_time = $('.tab-pane[data-id="3"]>h3').text(),
                TimeEnd = TimeStrTOTimeInt(wiz_upd_time),
                TimeLeft = TimeEnd,
                TimerId = setInterval(() => tick(), 1000);
                setTimeout(() => { clearInterval(TimerId); $('.tab-pane[data-id="3"]>h3').text("Обнови страницу что бы увидеть новые контракты")}, TimeEnd * 1000);
                function tick() {
                    TimeLeft--;
                    $('.tab-pane[data-id="3"]>h3').text("Сбросятся через " + TimeIntToStr(TimeLeft));
                }
            }
        }
    }

    // Обновление для страницы крафтов.
    if(loc.startsWith(LetragonLoc + "/crafting")) {
        let Items = {
            id: ['kys', 'obelisk', 'supply', 'magicshard', 'vanillabox', 'shardartefe'],
            desc: {kys: 'Синтезированный Кусь', obelisk: 'Обелиск создания', supply: 'Припасы', magicshard: 'Магический осколок', vanillabox: 'Стандартный сундук', shardartefe: 'Осколки Артефэ'}
        },
        HeadUpd = "Нет завершённых крафтов",
        TextUpd = "Обновлять нечего",
        HeadClaim = "Нет завершённых крафтов",
        TextClaim = "Собирать нечего",
        CUpd = 0,
        itemjr = [],
        ListUpd = [];
        for(let i = 0; i<Items.id.length; i++) {
            itemjr[i] = '[data-id="' + Items.id[i] + '"]';
            ListUpd[i] = "<li>" + Items.desc[Items.id[i]] + "</li>";
        }
        let Elist = $('.obj-left>.scroll-panel>div>div[data-phase="2"]:is(' + itemjr.join(',') + ')').toArray(),
        count_craft = Elist.length;
        ElistNRcount = $('.obj-left>.scroll-panel>div>div[data-phase="1"]:is(' + itemjr.join(',') + ')').toArray().length;
        if(count_craft) {
            HeadUpd = "Отправить все крафты <span style=\"opacity:.4\">(" + count_craft + ")</span> на склад магазина и перезапустить";
            TextUpd = "Обновить крафты";
            HeadClaim = "Отправить все крафты <span style=\"opacity:.4\">(" + count_craft + ")</span> на склад магазина";
            TextClaim = "Собрать всё";
        }
        if(ElistNRcount == 0) {
            HeadUpd = "Нет активных крафтов";
            HeadClaim = "Нет активных крафтов";
        }
        $(".obj-right>div[style]:not(class)").append('<div id="ButtonsUPD" style="display:inline-flex"></div>').find('#ButtonsUPD')
            .append("<div id='craft-update' class='pre-settings lilpipe' style='float:none;line-height:4em;font-size:2em;margin:2em 10px;width:fit-content;padding:0 20px;cursor:default' data-text='<h3 style=\"color:darkgoldenrod;border-bottom:1px solid darkgoldenrod\">" + HeadUpd + "</h3><ul style=\"list-style:inside\">Обновляет:" + ListUpd.join("") + "</ul>'>" + TextUpd + "</div>")
            .append("<div id='craft-claim' class='pre-settings lilpipe' style='float:none;line-height:4em;font-size:2em;margin:2em 10px;width:fit-content;padding:0 20px;cursor:default' data-text='<h3 style=\"color:darkgoldenrod;border-bottom:1px solid darkgoldenrod\">" + HeadClaim + "</h3><ul style=\"list-style:inside\">Собирает:" + ListUpd.join("") + "</ul>'>" + TextClaim + "</div>");
        $('#craft-update').click(craftUPD)
        $('#craft-claim').click(claimUPD);
        
        function craftUPD() {
            for(let i = 0; i < count_craft; i++) {
                let type = Elist[i].getAttribute('data-id');
                PostUPD(type);
            }
            $("#ButtonsUPD").remove();
            $('.tooltip').remove();
        }

        function claimUPD() {
            for(let i = 0; i < count_craft; i++) {
                let type = Elist[i].getAttribute('data-id');
                PostCraft(type);
            }
            $("#ButtonsUPD").remove();
            $('.tooltip').remove();
        }

        function PostUPD(type, where = '1') {
            if(type == 'vanillabox') where = -1;
            if(type == '' && where == '2') where = '1';
            $.post("/bin/ajax/craft-items.php", {action: 'open', type: type}, function() {
                $.post("/bin/ajax/craft-items.php", {action: 'send', type: type, place: where, args: ''}, function(b) {
                    if(b=='ok'){
                        $(".obj-left>.scroll-panel>div>div[data-id='" + type + "']").attr('data-phase','0').find('.guide-card-but-description').text('Отправлено');
                        $.post("/bin/ajax/craft-items.php", {action: 'craft', type: type, place: -1, args: ''}, function(b) {
                            if(b=='ok') {
                                $(".obj-left>.scroll-panel>div>div[data-id='" + type + "']").attr('data-phase','1').find('.guide-card-but-description').text('Обновлено');
                                CUpd++;
                                if(CUpd == count_craft) senpaiNotice('succes', 'Крафт', 'Обновление предметов завершено');
                            }
                            else {
                                console.log('├─Крафт "' + Items.desc[type] + '": ' + b);
                                senpaiNotice('info', 'Крафт "' + Items.desc[type] + '"', b);
                            }
                        });
                    }
                    else {
                        console.log('├─Отправка "' + Items.desc[type] + '": ' + b);
                        senpaiNotice('info', 'Отправка "' + Items.desc[type] + '"', b);
                    }
                });
            });
        }

        function PostCraft(type, where = '1') {
            if(type == 'vanillabox') where = -1;
            if(type == '' && where == '2') where = '1';
            $.post("/bin/ajax/craft-items.php", {action: 'open', type: type}, function() {
                $.post("/bin/ajax/craft-items.php", {action: 'send', type: type, place: where, args: ''}, function(b) {
                    if(b=='ok'){
                        $(".obj-left>.scroll-panel>div>div[data-id='" + type + "']").attr('data-phase','0').find('.guide-card-but-description').text('Отправлено');
                        CUpd++;
                        if(CUpd == count_craft) senpaiNotice('succes', 'Крафт', 'Сбор предметов завершен');
                    }
                    else {
                        console.log('├─Сбор "' + Items.desc[type] + '": ' + b);
                        senpaiNotice('info', 'Сбор "' + Items.desc[type] + '"', b);
                    }
                });
            });
        }
    }

    // Сортировка для Аукциона.
    if(loc.startsWith(LetragonLoc + "/auction")) {
        $('.BlockTable-head .BlockTable-label:nth-child(3)>div').append('<span id="sort-state" state="1" style="transition:.2s"></span>');
        $('.BlockTable-head .BlockTable-label:nth-child(3)').css('cursor', 'pointer').css('user-select','none').click(function() {TSort($('#sort-state').attr('state'))});

        let BlockTable_row = [],
        elems,
        count_auc = 0;
        UPD();
        $('.sidebar-menu>li').click("DOMSubtreeModified", function() {TSort('-1')});

        function UPD() {
            BlockTable_row = [];
            elems = $('.BlockTable-body .BlockTable-row').toArray();
            count_auc = elems.length;
            let prices = "";
            for(let i = 1; i <= count_auc; i++) {
                prices += $('.BlockTable-body .BlockTable-row:nth-child(' + i + ') .panel-price h3').text().split(" ")[0];
                if(i!=count_auc) prices += " ";
            }
            prices =  prices.split(" ");
            for(let i = 0; i < count_auc; i++) {
                BlockTable_row[i] = {id: i, price: prices[i], elem: elems[i]};
            }
        }

        function TSort(a) {
            UPD();
            switch(a) {
                //Сортировка по возрастанию
                case '1': {
                    $("#sort-state").text(" ↑").attr("state", 0).css('color', 'green');
                    BlockTable_row.sort(function(a, b) {return a.price - b.price});
                    break;
                }
                case '-1': {
                    $("#sort-state").text("").attr("state", 1).css('color', '');
                    BlockTable_row.sort(function(a, b) {return a.id - b.id});
                    break;
                }
                //Сортировка по убыванию
                default: {
                    $("#sort-state").text(" ↓").attr("state", 1).css('color', 'red');
                    BlockTable_row.sort(function(a, b) {return b.price - a.price});
                    break;
                } 
            }
            for(var i = 0; i < count_auc; i++) {
                $('.BlockTable-body').append(BlockTable_row[i].elem);
            }
        }
    }

    // Улучшение для списка гильдий.
    if(loc == LetragonLoc + "/guild") {
        $('.nav-user-name').attr('style', 'text-transform: none;');
        let rows = $('.BlockTable-row').toArray(),
        count_guild = rows.length,
        guilds = [],
        ready = false,
        readyC = 0;
        LoadingStatus('CheckGuildMembers', 'Загрузка членов гильдий', count_guild); 
        for(let i = 0; i < count_guild; i++) {
            function f(i) {
                let href = rows[i].getAttribute('href'),
                serverID = href.split('/')[2];
                if(GuildmembersCount) {
                    let name = $('.BlockTable-row[href="'+ href +'"] .nav-user-name').text();
                    $('.BlockTable-row[href="'+ href +'"]').append('<div id="count-guild-' + serverID + '" class="BlockTable-data"><b>Людей</b><br><span>? ? ?</span></div>');
                    $('#count-guild-' + serverID + '').load('/guild/' + serverID + '.htm #real-users-guild', function() {
                        let count = $('#real-users-guild>.BlockTable-body>.BlockTable-row').toArray().length;
                        $(this).html('<b>Людей</b><br><span>' + count + '</span>');
                        guilds[i] = {
                            ID: i,
                            serverID: serverID,
                            lvl: rows[i].querySelector('.BlockTable-data:nth-child(3)>span').innerText.split(' ')[0],
                            count: count
                        };
                        readyC++;
                        LoadingStatus('CheckGuildMembers', 'Загрузка членов гильдий', count_guild, readyC, name); 
                        if(readyC == count_guild) ready = true;
                    });
                }
                else {
                    guilds[i] = {
                        ID: i,
                        serverID: serverID,
                        lvl: rows[i].querySelector('.BlockTable-data:nth-child(3)>span').innerText.split(' ')[0]
                    };
                    ready = true;
                }
            }
            f(i);
        }

        $('.overlay-gley>div:last-child>h3').append('<div id="guild-sort" class="pre-settings" state="1">Нет сортировки</div>');
        $('#guild-sort').click(function(){GSort($(this).attr("state"))});

        function GSort(a) {
            if(ready) {
                switch(a) {
                    // Сортировка по уровню
                    case '1': {
                        $("#guild-sort").text("По руровню").attr("state", 2);
                        guilds.sort(function(a, b) {return b.lvl - a.lvl});
                        break;
                    } 
                    // Сортировка по количеству участников
                    case '2': {
                        if(GuildmembersCount) {
                            $("#guild-sort").text("По участникам").attr("state", 0);
                            guilds.sort(function(a, b) {return b.count - a.count});
                        }
                        else GSort(0);
                        break;
                    }
                    // Убрать сортировку
                    default: {
                        $("#guild-sort").text("Нет сортировки").attr("state", 1);
                        guilds.sort(function(a, b) {return a.ID - b.ID});
                        break;
                    } 
                }
                // Вывод результат сортировки
                for(var i = 0; i < count_guild; i++)
                    $(".BlockTable-body").append(rows[guilds[i].ID]);
            }
            else senpaiNotice('error', 'Ошибка', 'Загрузка количества участников ешё не завершена');
        }
    }

    // Улучшение страницы гильдии.
    if(loc.startsWith(LetragonLoc + "/guild/") && CheckRep) {
        // Дополнительная информация про участников гильдии.
        let list = $('#real-users-guild>.BlockTable-body>.BlockTable-row').toArray(),
        count_member = list.length;
        $('#real-users-guild>.BlockTable-head>.BlockTable-row').append('<div class="BlockTable-label list-guild-filter">Репутация</div>');
        $('head').append('<style>.stop-scrolling .main-content, .stop-scrolling .navbar{opacity: .3}.levelAward-init{position:fixed;background:rgba(0,0,0,.57);left:0!important;right:0;width:auto;top:0;height:100%;z-index:1030;overflow:auto}.n-exit{position:absolute;padding:5px 12px;transition:all .35s ease-in-out;color:#fff;text-transform:uppercase;top:25px;right:25px;border:1px solid rgba(255,255,255,.18);cursor:pointer;opacity:.8}.rates-user .n-exit{position:unset;float:right;margin:-40px 0}.rates-user .c-cards{display:grid;grid-template-columns:repeat(7,1fr);grid-gap:4px;width:100%}.n-exit:hover{background-color:#1b91a0}.awards-levels{max-width:80%;margin:35px auto}.awards-levels.rates-user{margin-top:50px}.save-cater{background:#909090;padding:8px 0;text-transform:uppercase;transition:.2s;width:100%;color:#fff;cursor:pointer;text-align:center}.save-cater:hover{background:#989090}#block-info-friend{background:rgba(255,255,255,0.08);padding:10px 0;width:100%;margin-bottom:10px;text-align:center;text-transform:uppercase;color:#848484}.rep-players{opacity:.7}.rep-players:hover{opacity:1}.rep-players figcaption{padding:6px;min-height:0;margin:0}.icon-c{width:64px;height:64px;margin:0 auto;background-repeat:no-repeat;background-size:contain;background-position:center;border-radius:50%}figcaption{position:relative;margin-bottom:1.75rem;padding:1em;line-height:1.75;font-size:14px;font-style:normal;color:rgba(255,255,255,.5);background-size:6px 6px;text-align:left;height:initial;z-index:1;min-height:336px;border-radius:0 0 2px 2px}.c-card{cursor:pointer;transition: .3s;width:100%;margin:0}.btn-char{text-transform:uppercase;text-align:center;color:#fff;font-size:.9em;padding:2px}.btn-char>span>b{font-size:.8em;display:block}</style>');
        for(let i = 0; i < count_member; i++) {
            let name = list[i].getAttribute('data-name'),
            UserPage = '/user/' + name + '/';
            $('.BlockTable-row[data-name="' + name + '"]').append('<div id="Rep-' + name + '" class="BlockTable-data text-center">? ? ?</div>');
            $('#Rep-' + name).load(UserPage + ' .treasury-panelMain:nth-child(5)>h4', function() {
                $('body').on('click', "#Rep-" + name + ">h4>span[data-rep]", function () { $.post("/bin/ajax/ajax_profile_modules.php", { action: "historyfive", pantsu: { name: name } }, function (d) { if (d != '0') { $('body').addClass("stop-scrolling").prepend($('<div></div>').attr("class", "levelAward-init")); $('.levelAward-init').html('<div class="awards-levels rates-user"><div class="n-exit" onclick="$(\'.levelAward-init\').remove(), $(\'body\').removeClass(\'stop-scrolling\')">Закрыть</div>' + d + '</div>'); } else { senpaiNotice('info', 'Репутация', 'Нет ни одного изменения репутации'); } }); return false; });
            });
        }
        $('.BlockTable-data.text-center, .list-guild-filter').css('width', '10%');
    }

    // Улучшения для страницы настроек
    if(loc.startsWith(LetragonLoc + "/overview")) {
        /*
        $('.tab-content>.tab-pane[data-id="2"]').append('<div id="drop_file_zone" ondrop="upload_file(event)" class="panel-setting" style="margin-bottom:20px"><div class="panel-setting"><h3>Файл стилей</h3><p>Для отправки файла просто перетащите его сюда</p></div><input type="checkbox" id="small_style" style="width:fit-content" checked><label for="small_style" style="padding-left:10px">Сжимать файл перед отправкой</label></div>');
        $('.tab-content>.tab-pane[data-id="2"]').append($('.load-style-kohai'));

        //$('#drop_file_zone').on('drop',upload_file(event));
        function upload_file(e) {
            e.preventDefault();
            console.log("dropped");
            var fileobj = e.dataTransfer.files[0];
            //ajax_file_upload(fileobj);
        }
        */
        $('.sidebar-menu').append('<div class="u-margin-bottom-sm"></div><h3>Letragon+</h3><li data-id="272">Настройки<div style="opacity:.6;font-size:90%">Дополнительные настройки</div></li>');
        $('.tab-content').append('<div class="tab-pane" data-id="272"></div>');
        $('.tab-pane[data-id="272"]').append('<div id="extension-settings" class="letragon-settings"><h3>Настройки расширения Letragon+<div id="extension-clear" class="pre-settings">Восстановить по умолчанию</div></h3></div><div id="extension-style-settings" class="letragon-settings"><h3>Быстрые стили</h3><div class="cssList"></div></div>');
        let list = [
            {attack_id: "CheckStyle", head: "Дополнительная информация &> Стили", desc: "Добавление проверки на наличия стилей у игроков", imp: "Если у вас установленны стили, то будет выделять и игроков с активным зеркалом стилей", empty: "0"},
            {attack_id: "CheckRep", head: "Гильдии &> Информация про участников", desc: "Добавление репутации игроков в список участников гильдии", empty: "1"},
            {attack_id: "GuildmembersCount", head: "Гильдии &> Количество участников", desc: "Добавление в список гильдий информации про количество участников", empty: "1"},
            {attack_id: "WizTimers", head: "Лавочка Виз &> Таймеры", desc: "Добавление на страницу активных таймеров", empty: "1"},
            {attack_id: "ShowAchStat", head: "Профиль &> Достижения", desc: "Показывать % игроков которые получили достижение", empty: "0"}
        ];
        let ArrowRight = "<span style='color:gray' > - </span>";
        $('#extension-clear').click(function() {
           $('#extension-settings>.letragon-setting-one-is-one').remove();
           for(let i = 0; i < list.length; i++)
                localStorage.clear(list[i].attack_id);
           extension_settings_load();
        });
        function extension_settings_load() {
            for(let i = 0; i < list.length; i++)
                if(localStorage.getItem(list[i].attack_id) == null)
                    localStorage.setItem(list[i].attack_id, list[i].empty);
                
           for(let i = 0; i < list.length; i++) {
               let imp = list[i].imp ? ' <span style="color:lightcoral;opacity:.6">(' + list[i].imp + ')</span>' : '';
               $('#extension-settings').append('<div class="letragon-setting-one-is-one" trigger-senpai-attack="' + localStorage.getItem(list[i].attack_id) + '" attack-is-id="' + list[i].attack_id + '"><div><h4>' + list[i].head.replace('&>', ArrowRight) + '</h4><p>' + list[i].desc + imp + '</p></div><div>Нажмите для переключения</div></div>');
            }
            $('#extension-settings>.letragon-setting-one-is-one>div:last-child').click(function() {
                let t =$(this).parent();
                t.ready(function() {
                    let attack_id = t.attr('attack-is-id'),
                    flag = t.attr('trigger-senpai-attack');
                    localStorage.setItem(attack_id, flag);
                });
           });
        }
        extension_settings_load();
  
        // Быстрые стили.
        let TypeMax = {deg: 360, per: 100};
        $('#extension-style-settings').append('<style>input[type="range"]{box-shadow:none!important;height:35px;overflow:hidden;cursor:pointer;background:transparent;width:100%;margin:0;outline:none;margin-right:11px}input[type="range"],input[type="range"]::-webkit-slider-runnable-track,input[type="range"]::-webkit-slider-thumb{-webkit-appearance:none}input[type="range"]::-webkit-slider-runnable-track{height:8px;background:rgba(255,255,255,.2)}input[type="range"]::-webkit-slider-thumb{position:relative;height:22px;width:22px;margin-top:-8px;background:#0f1010;box-shadow:0 0 15px rgba(0,0,0,.1);border-radius:2px}input[type="range"]::-webkit-slider-thumb::before{position:absolute;content:"";height:10px;width:500px;left:-502px;top:8px;background:#777}.cssList{display:grid;grid-template-columns:repeat(4,1fr);grid-gap:4px}.style-card:hover{opacity:1!important}.style-card{transition:.8s;width:100%;border:1px solid gray;cursor:pointer;text-align:center}.extension-style-info{padding:20px;text-align:center;border-top:1px solid gray}.bg-img-list{display:none}.bg-img-list.active{display:grid;grid-template-columns:repeat(4,1fr);grid-gap:4px}.bg-img-list h3{text-align:center;margin-top:10px}.bg-img-list>div{padding:4px;border:2px solid #343434;opacity:.5;transition:.2s ease-in-out;cursor:pointer}.bg-img-list>div:hover{padding:2px;border:4px solid #343434;opacity:1}.bg-img-list>.active{opacity:1;border-color:#444444;background-color:#222222}</style><div id="cssListLoading" style="display:none"></div>').find('#cssListLoading').load('//dangarte.github.io/Letragon/extension/css.json', function() {
            let cssList = JSON.parse($('#cssListLoading').text())['aviable-css'],
            bg_img_list = JSON.parse($('#cssListLoading').text())['bg-img-list'],
            IMGlinks = {},
            IMGloaded = 0;
            loadIMG();
            function appendIMG(creator, name) {
                if(IMGlinks[creator])
                $('.style-card[data-id="' + name + '"] .box').append('<img src="' + IMGlinks[creator] + '" class="player-portrait" style="border-color:#db83ff;cursor:pointer" alt="">').append('<h3 class="creator-name">' + creator + '</h3>');
            }
            function loadIMG() {
                if(IMGloaded != cssList.length) {
                    let creator = cssList[IMGloaded].creator
                    if(!IMGlinks[creator])
                        $('body').append('<div id="LoadLinkIMGlist" style="display:none"></div>').find('#LoadLinkIMGlist').load('/user/' + creator + '/ .masthead>img', function(){
                            IMGlinks[creator] = $(this).find('img').attr('src');
                            $(this).remove();
                            IMGloaded++;
                            loadIMG();
                        });
                    else
                    {
                        IMGloaded++;
                        loadIMG();
                    }
                }
                else NF();
            }
            function NF() {
                for(let i = 0; i < cssList.length; i++) {
                    let ExtensionOtherValues = "",
                    ExtensionSettingValues = "",
                    ExtensionSettings = "",
                    ColorPallete = "",
                    OtherValues = cssList[i]['other-values'],
                    SettingValues = cssList[i].settings,
                    name = cssList[i].name,
                    demo = "--demo-" + name + "--";
                    if(iHaveGuild) {
                        SettingValues.unshift({name: "guild-color-H", desc: "Цвет выделения членов вашей гильдии", type: "deg", default: 100});
                        OtherValues.unshift({name:"guild-color", desc: "Цвет выделения членов вашей гильдии", value:"hsl(var(--guild-color-H), 90%, 30%)", type: "color"});
                    }
                    for(let j = 0 ; j < OtherValues.length; j++) {
                        let o = OtherValues[j];
                        ExtensionOtherValues += demo + o.name + ':' + o.value.split('var(--').join('var(' + demo) + ';';
                        if(o.type == "color") {
                            ColorPallete += '<div class="color lilpipe" style="height:20px;background:var(' + demo + o.name + ')" data-text="' + o.desc + '"></div>';
                        }
                    }
                    for(let j = 0 ; j < SettingValues.length; j++) {
                        let o = SettingValues[j];
                        let text = $('#custom-css-senpai').text();
                        var PrevValue = "";
                        if(text.includes('--' + o.name + ':')) {
                            let a = text.indexOf('--' + o.name + ':') + ('--' + o.name + ':').length,
                            b = text.indexOf(';', a);
                            PrevValue = text.substr(a, b - a);
                        }
                        else
                            PrevValue = String(o.default);
                        switch(o.type) {
                            case "deg":        
                            case "px":
                                PrevValue = PrevValue.replace(o.type, '');
                            case "per": {
                                PrevValue = PrevValue.replace('%', '');
                                o.default = PrevValue;
                                if(!(o.min)) o.min = 0;
                                if(!(o.max)) o.max = TypeMax[o.type];
                                let max = (o.max && Number(o.max) > Number(o.min)) ? 'max="' + o.max + '"' : '',
                                imp = o.imp ? ' <span style="color:lightcoral;opacity:.6">(' + o.imp + ')</span>' : '';
                                ExtensionSettings += '<div class="extension-setting" name="' + o.name + '" type="' + o.type + '" style="display:flex"><div style="width:calc(100% - 7em)"><h3>' + o.desc + imp + '</h3><input type="range" name="' + o.name + '" min="' + o.min + '" ' + max + ' value="' + o.default + '" onmousemove="$(this).parent().parent().find(\'.extension-setting-value\').val(this.value)" onchange="$(this).parent().parent().find(\'.extension-setting-value\').val(this.value)"></div><div style="margin-left:2em;width:5em"><h3> </h3><input type="text" class="extension-setting-value" style="text-align:center" min="' + o.min + '" max="' + o.max + '" value="' + o.default + '" onchange="$(this).parent().parent().find(\'input[type=\\\'range\\\']\').val(this.value)"></div></div></div>';
                                    break;
                                }
                                case "link": {
                                    let def = '';
                                    PrevValue = PrevValue.replace('url(', '').replace(')', '');
                                    o.default = PrevValue,
                                    Plist = '',
                                    IMGlist = '';
                                    def = ' value="' + PrevValue + '"';
                                    if(o.name == "bg-img") {
                                        Plist = '<div data-id="' + name + '" class="pre-settings bg-img-but" style="margin-left:2em;text-align:center;height:fit-content">Из списка</div>';
                                        let list = [];
                                        bg_img_list.forEach(e => {
                                            list.push('<div link="' + e.link + '"><div style="height:200px;background:url(' + e.link + ') top/cover"></div><h3>' + e.desc + '</h3></div>');
                                        });
                                        if(!list) list = [''];
                                        IMGlist = '<div class="bg-img-list" data-id="' + name + '">' + list.join('') + '</div>';
                                    }
                                    let imp = o.imp ? ' <span style="color:lightcoral;opacity:.6">(' + o.imp + ')</span>' : '';
                                    ExtensionSettings += '<div class="extension-setting" name="' + o.name + '" type="' + o.type + '" style="display:flex"><h3>' + o.desc + imp + '</h3><input type="text" class="extension-setting-value" ' + def + '>' + Plist + '</div>' + IMGlist;
                                break;
                            }
                            default: break;
                        }
                        ExtensionSettingValues += SettingValue(demo, o);
                    }
                    $('#extension-style-settings>.cssList').append('<div class="style-card" data-id="' + name + '" style="opacity: .4;"><div class="extension-style-demo"><style type="text/css">.style-card[data-id="' + name + '"],.style-colors[data-id="' + name + '"]{' + ExtensionSettingValues + "\n" + ExtensionOtherValues + '}\n' + cssList[i].demo + '</style><div class="box"></div></div><div class="extension-style-info"><h2>' + name + '</h2><span> v' + cssList[i].version + '</span><p>' + cssList[i].desc + '</p></div></div>'); appendIMG(cssList[i].creator, name);
                    $('#extension-style-settings').append('<div class="style-settings" style="display: none; margin-top: 20px;" data-id="' + name + '"><h5 style="margin-top:2em">Настройки стиля ' + name + '</h5><h3>Цветовая палитра стиля</h3><div class="style-colors" data-id="' + name + '" style="display:grid;grid-template-columns:repeat(8,1fr);grid-gap:4px;margin:2em 0">' + ColorPallete + '</div></div>');
                    if(name == UStyleName) {
                        $('.style-card[data-id="' + name + '"]').toggleClass('active').css('opacity', '1');
                        $('.style-settings[data-id="' + name + '"]').toggleClass('active').css('display', 'block');
                    }
                    $('.style-settings[data-id="' + name + '"]').append(ExtensionSettings + '<div class="close-styles" data-id="' + name + '" style="margin-top:2em;text-align:center;background:darkslategray">Установить стиль</div>').find('.close-styles').click(function(e) {
                        let StyleName = $(this).attr('data-id'), StyleSettings = "", s =$('#extension-style-settings');
                        cssList[i].settings.forEach(el => StyleSettings +=SettingValue('--', el, s.find('.style-settings[data-id="' + name + '"] .extension-setting[name="' + el.name + '"] .extension-setting-value').val()));
                        senpaiNotice('info', 'Стили', 'Загрузка стиля <span style="color:gold">' + StyleName + '</span>!');
                        SetStyle(StyleName, cssList, StyleSettings);
                    });
                    $('#extension-style-settings .extension-setting').on('input', function() {
                        let name = $(this).parent().attr('data-id'),
                        t = $('.style-card[data-id="' + name + '"] style'),
                            Val = {name: $(this).attr('name'), type: $(this).attr('type')},
                            value = $(this).find('input').first().val(),
                            text = t.text(),
                            a = text.indexOf(demo + Val.name + ':') + (demo + Val.name + ':').length,
                            b = text.indexOf(';', a);
                            let PrevValue = text.substr(a, b - a);
                            switch(Val.type){
                                case "deg":        
                                case "px": {
                                    PrevValue = PrevValue.replace(Val.type, '');
                                    break;
                                }
                                case "per": {
                                    PrevValue = PrevValue.replace('%', '');
                                    break;    
                                }
                                case "link": {
                                    PrevValue = PrevValue.replace('url(', '').replace(')', '');
                                    break;    
                                }
                                default: break;
                            }
                        if($(this).attr('name') == 'bg-img') $('.bg-img-list[data-id="' + name + '"]>.active').removeClass('active');
                        t.text(t.text().replace(SettingValue(demo, Val, PrevValue), SettingValue(demo, Val, value)));
                    });
                    function SettingValue(start, o, NewVal = o.default) {
                        switch(o.type) {
                            case "deg":        
                            case "per":
                            case "px": {
                                return start + o.name + ":" + NewVal + o.type.replace('per', '%') + ";";
                                }
                            case "link": {
                                if(NewVal)
                                    return start + o.name + ':url(' + NewVal + ');';
                                else
                                    return start + o.name + ':url();';
                            }
                            default: return "";
                        }
                    }
                }
            }
            $('body').on('click', '.bg-img-but[data-id]', function() {$('.bg-img-list[data-id="' + $(this).attr('data-id') + '"]').toggleClass('active');});
            $('body').on('click', '.bg-img-list[data-id]>div[link]', function() {
                let id = $(this).parent().attr('data-id'),
                t = $('.style-settings[data-id="' + id + '"] .extension-setting[name="bg-img"]>input');
                t.val($(this).attr('link'));
                t.trigger('input');
                $('.bg-img-list[data-id="' + id + '"]>.active').toggleClass('active');
                $(this).toggleClass('active');
            });
            $('body').on('click', '.style-card[data-id]', function() {
                let id = $(this).attr('data-id');
                $('.style-card.active').toggleClass('active').css('opacity', '.4');
                $('.style-settings.active').toggleClass('active').css('display', 'none');
                $('.style-card[data-id="' + id + '"]').toggleClass('active').css('opacity', '1');
                $('.style-settings[data-id="' + id + '"]').toggleClass('active').css('display', 'block');
            });
            $(this).remove();
        });
    }

    // Проверка наличия стилей. 
    if(CheckStyle) {
        let UserInfoLink = $('[data-usercard-mid]').append('<div class="i-have-style" style="display:none">? ? ?</div>').toArray(),
        count_UserInfoLink = UserInfoLink.length,
        UserCheckedStyle = localStorage.getItem('UserCheckedStyle') ? localStorage.getItem('UserCheckedStyle').split(';') : [0,0],
        UserCheckedStyleTimeToDestroy;
        UserCheckedStyleList = [];
        if(UserCheckedStyle[0] > +new Date()) {
            UserCheckedStyleTimeToDestroy = UserCheckedStyle[0];
            UserCheckedStyle = UserCheckedStyle[1].split(',');
            UserCheckedStyle.forEach(el => {
                UserCheckedStyleList.push(el.split(':')[0]);
            });
        }
        else {
            UserCheckedStyleTimeToDestroy = +new Date() + TimeToReloadStyle * 3600000;
            UserCheckedStyle = [];
        }
        if(count_UserInfoLink > 0) {
            let lookAtUserInfoList = [],
            lookAtUserInfoListIndex = 0,
            loaded = 0;
            for(let i = 0; i < count_UserInfoLink; i++) {
                let UserID = $(UserInfoLink[i]).attr('data-usercard-mid');
                if($.inArray(UserID, lookAtUserInfoList) == -1) {
                    lookAtUserInfoList[lookAtUserInfoListIndex] = UserID;
                    lookAtUserInfoListIndex++;
                }
            }
            LoadingStatus('CheckStyle', 'Загрузка стилей', lookAtUserInfoListIndex); 
            for(let i = 0; i < lookAtUserInfoListIndex; i++) {
                let UserID = lookAtUserInfoList[i];
                lookAtUserInfo(UserID);
            }
            function lookAtUserInfo(id) {
                let UserName = "",
                t = $('[data-usercard-mid="' + id + '"]>.i-have-style');
                if(t.length > 0) {
                    if(!UserCheckedStyleList.includes(id))
                        $.post("/bin/ajax/because_senpai.php", {action: "userinfocardsite", id: id}, function(d) {
                            UserName = $(d).find('.name').text();
                            t.first().load('/user/' + UserName + '/ #custom-css-senpai', function() {
                                if($(this).text().length < 1300) {
                                    t.remove();
                                    UserCheckedStyle.push(id + ':0');
                                }
                                else UserCheckedStyle.push(id + ':1');
                                t.text('S');
                                loaded++;
                                LoadingStatus('CheckStyle', 'Проверка стилей', lookAtUserInfoListIndex, loaded, UserName);
                                if(loaded == lookAtUserInfoListIndex) {
                                    $('.i-have-style').text('S').attr('style','user-select:none;text-align:center;font-size:2em;color:lightgreen;line-height:.5;position:absolute;right:0;top:0;background:lightgreen;border-radius:40%;box-shadow:0 0 2px 2px black').parent().css('position', 'relative');
                                    localStorage.setItem('UserCheckedStyle', UserCheckedStyleTimeToDestroy + ';' + UserCheckedStyle.join(','));
                                }
                            });
                        });
                    else {
                        if(UserCheckedStyle.find(el => el.split(':')[0] == id).split(':')[1] == 1) t.text('S');
                        else t.remove();
                        loaded++;
                        LoadingStatus('CheckStyle', 'Проверка стилей', lookAtUserInfoListIndex, loaded, 'Проверено ранее');
                        if(loaded == lookAtUserInfoListIndex) {
                            $('.i-have-style').text('S').attr('style','user-select:none;text-align:center;font-size:2em;color:lightgreen;line-height:.5;position:absolute;right:0;top:0;background:lightgreen;border-radius:40%;box-shadow:0 0 2px 2px black').parent().css('position', 'relative');
                            localStorage.setItem('UserCheckedStyle', UserCheckedStyleTimeToDestroy + ';' + UserCheckedStyle.join(','));
                        }
                    }
                }
            }
        }
        function RateUsersStyle() {
            $('body').one('DOMNodeInserted', '.rates-user', function() {
                $('.rates-user').ready(function() {
                    $('.n-exit').click(RateUsersStyle);
                    let loaded = 0,
                    t = $('.rates-user').find('a');
                    t.find('.icon-c').append('<div class="i-have-style" style="display:none">? ? ?</div>').toArray();
                    for(let i = 0; i < t.length; i++) {
                        $(t[i]).find('.i-have-style').load($(t[i]).attr('href') + ' #custom-css-senpai', function() {
                            if($(this).text().length < 1300) {
                                $(this).remove();
                            }
                            $(this).text('S');
                            loaded++;
                            if(loaded == t.length) {
                                $('.i-have-style').text('S').attr('style','user-select:none;text-align:center;font-size:2em;color:lightgreen;line-height:.5;position:absolute;right:0;top:0;background:lightgreen;border-radius:40%;box-shadow:0 0 2px 2px black').parent().css('position', 'relative');
                            }
                        });
                    }
                });
            });
        }
        RateUsersStyle();
    }

    // Добавление % выполнивших достижение.
    if(loc.startsWith(LetragonLoc + "/user/") && ShowAchStat) {
        let s = $('body').append('<div id="LoadingAchStats" style="display:none"></div>').find('#LoadingAchStats');
        let AchStats,
            DB_info;
        $('head').append('<style>.WhoHaveThisAch{position:absolute;width:100%;text-align:center;top:4px;opacity:0;transition:.2s}.Achievement-container:hover .WhoHaveThisAch{opacity:.7}</style>');
        s.load('//dangarte.github.io/Letragon/extension/DB/DB-info.json', function() {
            if(s.text()) {
                DB_info = JSON.parse($(s).text());
                s.text('');
                s.load('//dangarte.github.io/Letragon/extension/DB/ach.json', function() {
                    if(s.text())
                    AchStats = JSON.parse($(s).text());
                    ACH_STATS_LOADING_READY();
                    $(s).remove();
                });
            }
        });
        function ACH_STATS_LOADING_READY() {
            $('body').on('click', '.awards-cat-panel[data-id]', function() {
                let id = $(this).attr('data-id');
                let CurrentAchList = AchStats[id];
                $('body').one('DOMNodeInserted', '#achiewments_list[data-cat="' + id + '"]', function() {
                    $(this).ready(function() {
                        let t = $(this).find('.tab-content .Achievement-container').toArray();
                        t.forEach(el => {
                            let ach_id = $(el).find('.Achievement-title').text();
                            if(CurrentAchList[ach_id]) $(el).append('<div class="WhoHaveThisAch">Имеют: <span style="color:gold">' + CurrentAchList[ach_id].length + '</span> <span style="opacity:.5">(' + (CurrentAchList[ach_id].length * 100 / DB_info.who_have_ach).toFixed(2) + '% | ' + (CurrentAchList[ach_id].length * 100 / DB_info.count_users).toFixed(3) + '%)</span></div>');
                        });
                    });
                });
            });
            $('body').on('click', '.Achievement-container', function() {
                let id = $(this).find('.Achievement-title').text(),
                cat_id = $(this).parent().parent().parent().parent('#achiewments_list').attr('data-cat');
                if(!cat_id) cat_id = $(this).parent().parent('#achiewments_list').attr('data-cat');
                let userlist = [];
                AchStats[cat_id][id].forEach(el =>{
                    userlist.push('<li><a href="/user/' + el + '/" target="_blank" style="color:white">' + el + '</a></li>');
                });
                $('.cover-modal-init').ready(function() {
                    $('.cover-modal-init .iziModal-content').append('<div style="position:fixed;overflow-y:scroll;padding:20px;height:300px;width:300px;bottom:60%;left:calc(50% - 150px)"><ul style="list-style:inside">' + userlist.join('') + '</ul></div>');
                });
            });
        }
    }

    // Функция вывода полоски статуса загрузки.
    function LoadingStatus(clas, text, all, stage = -1, desc = "") {
        let t = $('#LoadingStatus.' + clas);
        if(t.length <= 0) {
            $('.navbar .nav-sectionLeft').append('<div id="LoadingStatus" class="nav-menuItem nav-item ' + clas + '" style="padding:0 10px;position:relative"><span></span><b style="position:absolute;top:8px;left:0;line-height:1;text-align:center;width:100%;color:gray"></b><div style="position:absolute;height:2px;background:gray;width:0;top:4px"></div></div>');
            t = $('#LoadingStatus.' + clas);
        }
        if(stage >= 0) {
            if(stage == all) t.remove();
            else {
                let v = Math.round(stage*100/all);
                t.find('span').text(text + ' ' + stage + ' из ' + all);
                t.find('b').text(desc);
                t.find('div').css('width', v + '%');
            }
        }
        else {
            t.find('span').text(text + ' (' + all + ')');
        }
    }
    // Функция перевода времени в числа
    function TimeStrTOTimeInt(TimeStr) {
        // Входные данные, пример: "40 секунд"
        // Выходные данные, пример: 40
        let TimeInt = {d: 0, h: 0, m: 0, s: 0};
        TimeStr = TimeStr.replace('.', '').replace(',', '').split(" ");
        for(let i = 0; i < TimeStr.length - 1; i++) {
            switch (TimeStr[i + 1]) {
                case 'дня':
                case 'день':
                case 'дней':
                    TimeInt.d = Number(TimeStr[i]);
                    break;
                case 'час':
                case 'часов':
                case 'часа':
                    TimeInt.h = Number(TimeStr[i]);
                    break;
                case 'минут':
                case 'минута':
                case 'минуты':
                case 'минуту':
                    TimeInt.m = Number(TimeStr[i]);
                    break;
                case 'секунд':
                case 'секунда':
                case 'секунды':
                case 'секунду':
                    TimeInt.s = Number(TimeStr[i]);
                    break;
                default:
                    break;
            }
        }
        return Number(TimeInt.d * 86400) + Number(TimeInt.h * 3600) + Number(TimeInt.m * 60) + Number(TimeInt.s);
    }
    // Функция перевода числа в время
    function TimeIntToStr(TimeInt, s = true) {
        // Входные данные, пример: 40
        // Выходные данные, пример: "40с"
        let TimeStr = [];
        if(TimeInt > 86400) {
            let b = Math.floor(TimeInt / 86400);
            TimeStr.push(b + 'д');
            TimeInt -= b * 86400;
        }
        if(TimeInt > 3600) {
            let b = Math.floor(TimeInt / 3600);
            TimeStr.push(b + 'ч');
            TimeInt -= b * 3600;
        }
        if(TimeInt > 60) {
            let b = Math.floor(TimeInt / 60);
            TimeStr.push(b  + 'м');
            TimeInt -= b * 60;
        }
        if(TimeInt && s)
            TimeStr.push(TimeInt + 'с');
        return TimeStr.join(' ');
    }

    // Функция для установки стиля.
    function SetStyle(StyleName, CSS = [], StyleSettings = "") {
        let t = $('body').append('<div id="SetStyle" style="display:none"></div>').find('#SetStyle'),
        UserName = $('#personal-nav>.nav-user-name').attr('let-name');
        if(CSS.length) CSS_JSON_READY(CSS);
        else t.load('//dangarte.github.io/Letragon/extension/css.json', function() {CSS_JSON_READY(JSON.parse(t.text())['aviable-css']);t.text('');});
        function CSS_JSON_READY(CSS) {
            let o = CSS.find(el => el.name == StyleName),
            OtherValues = "";
            if(o) {
                if(!StyleSettings) {
                    let PrevStyleSettings = GetSubStr($('#custom-css-senpai').text(), '/*-SettingsStart-*/', '/*-SettingsEnd-*/').replace(':root{', '').replace('}', '').split(';');
                    console.log(PrevStyleSettings);
                    o.settings.forEach(el => {
                        PrevStyleSetting = PrevStyleSettings.find(e => e.startsWith('--' + el.name)).split(':')[1];
                        if(PrevStyleSetting) {
                            switch(el.type) {
                                case "deg":        
                                case "px": {
                                    PrevStyleSetting = PrevStyleSetting.replace(el.type, '');
                                    break;
                                }
                                case "per": {
                                    PrevStyleSetting = PrevStyleSetting.replace('%', '');
                                    break;
                                }
                                case "link": {
                                    PrevStyleSetting = PrevStyleSetting.replace('url(', '').replace(')', '');
                                    break;
                                }
                                default: break;
                            }
                            StyleSettings += SettingValue(el, PrevStyleSetting);
                        }
                        else StyleSettings += SettingValue(el);
                    });
                }
                o['other-values'].forEach(el => OtherValues += '--' + el.name + ':' + el.value + ';');
                t.load('//dangarte.github.io/Letragon/extension/css/' + StyleName + '.css', function() {
                    let style = '/*-SettingsStart-*/:root{' + StyleSettings + OtherValues + '--cleaner_please_stop_delete_my_last_symbol:"спасибА!";}/*-SettingsEnd-*/\n/* Если хочешь взять эти стили, не забудь оставить ссылку на профиль создателя - http://letragon.ru/user/' + o.creator + '/ */\n/*"info":{"name":"' + o.name + '","version":"' + o.version + '","creator":"' + o.creator + '"}*/\n' + t.text().split('"' + o.creator + '"]').join('"' + UserName + '"]');
                    t.text('');
                    if(iHaveGuild) {
                        t.load(iHaveGuild + ' #real-users-guild>.BlockTable-body>.BlockTable-row', function() {
                            let MembersSee = [],
                            GuildID = iHaveGuild.split('/')[2];
                            t.find('.BlockTable-row').toArray().forEach(el => MembersSee.push('[href*="' + $(el).attr('data-name') + '"]'));
                            style = '/*SelectionGuildMembers*/:is(#otmal[data-action="time-rate"] .main-content .nav-user-name,.user-server,.user-card,.fraction-sorat-panel a,.c-card a,.friends-server a):is(' + MembersSee.join(',') + '){--l-b-c: var(--guild-color)}' + '\n' + style;
                            if(JN['guild-css'].includes(GuildID)) {
                                t.load('//dangarte.github.io/Letragon/extension/css/guilds/' + GuildID + '.css', function() {
                                    style += '\n/*GuildStyle*/' + t.text().split('"Dangart"]').join('"' + UserName + '"]');
                                    t.text('');
                                    GUILD_CHECK_READY();
                                });
                            }
                            else GUILD_CHECK_READY();
                        });
                    }
                    else GUILD_CHECK_READY();
                    function GUILD_CHECK_READY() {
                        if(JN['personal-css'].includes(UserName)) {
                            t.load('//dangarte.github.io/Letragon/extension/css/users/' + UserName + '.css', function() {
                                style += '\n/*PersonalStyle*/' + t.text();
                                t.text('');
                                USER_CHECK_READY();
                            });
                        }
                        else USER_CHECK_READY();
                        function USER_CHECK_READY() {
                            style += '\n/* Тут можно вставить свои стили, и они будут сохранены при обновлении стиля до новой версии или при их переустановке */\n/*-CustomCssBlockStart-*/\n' + GetSubStr($('#custom-css-senpai').text(), '/*-CustomCssBlockStart-*/', '/*-CustomCssBlockEnd-*/') + '\n/*-CustomCssBlockEnd-*/';
                            senpaiNotice('info', 'Стили', 'Сохранение стиля <span style="color:gold">' + StyleName + '</span>!');
                            $.post("/bin/ajax/because_senpai.php", {action: "kohaiwantstochangetheworld", style: style}, function(b) {if (b != 'ok') senpaiNotice('info', 'Стили', b); else senpaiNotice('success', 'Стили', 'Стиль <span style="color:gold">' + StyleName + '</span> успешно установлен.<br>Версия стиля <span style="color:gold">v' + o.version + '</span>');});
                            t.remove();
                        }
                    }
                });
            }
            else senpaiNotice('info', 'Стили', 'Стиль <span style="color:gold">' + StyleName + '</span> не найден!');

        }
        function SettingValue(o, NewVal = o.default) {
            switch(o.type) {
                case "deg":        
                case "per":
                case "px": {
                    return '--' + o.name + ':' + NewVal + o.type.replace('per', '%') + ';';
                    }
                case "link": {
                    return '--' + o.name + ':url(' + NewVal ? NewVal : '' + ');';
                }
                default: return "";
            }
        }
    }
});
// Функция вывода сообщений, стырено из функий летрагона.
function senpaiNotice(l,o,v){senpaiTryDifferentObscenities.add(l,o,v);}
const senpaiTryDifferentObscenities = {add: function (style_class, name, text) { $('.gritter-item-wrapper').remove(); $('body').append('<div class="gritter-item-wrapper ' + style_class + '"><div class="gritter-gentle-entry">' + name + '<p>' + text + '</p></div></div>'); let item = $('.gritter-item-wrapper'), senpai_looks; this.setFadeTimer(item); $(item).on({ mouseenter: function () { senpaiTryDifferentObscenities.restoreItemIfFading() }, mouseleave: function () { senpaiTryDifferentObscenities.setFadeTimer($(this)) } }); }, restoreItemIfFading: function () { clearTimeout(senpai_looks); }, setFadeTimer: function (e) { senpai_looks = setTimeout(function () { e.animate({ opacity: 0 }, 1000, function () { e.remove(); }); }, 3600); }};
// Функция вывода сообщений в консоль.
function consoleNotice(type, head, desc, color = 'aqua') {
    let f;switch(color){case 'black':f=30;break;case 'red':f=31;break;case 'green':f=32;break;case 'yellow':f=33;break;case 'blue':f=34;break;case 'magenta':f=35;break;case 'aqua':f =36;break;default:f=36;break;}
    let c = '\x1b[' + f + 'm', d = '\x1b[0m';
    console.log(c + '┏━━━━━━━━━━━━━━ ━━ ━ ━\n┃ ' + type + '\n┃ ' + d + head.split('\n').join(c + '\n┃ ' + d) + c + '\n┃ ' + d + desc.split('\n').join(c + '\n┃ ' + d) + c + '\n┗━━━━━━━━━━━━━━ ━━ ━ ━');
}
// Функция получения фрагмента между строками StartStr и EndStr из Str.
function GetSubStr(Str, StartStr, EndStr) {
    if(Str.includes(StartStr) && Str.includes(EndStr)) {
        let SS = Str.indexOf(StartStr) + (StartStr).length,
        SE = Str.indexOf(EndStr);
        return Str.substr(SS, SE - SS).split(';');
    }
    else return '';
}