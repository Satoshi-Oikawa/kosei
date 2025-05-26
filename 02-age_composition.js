/*
    幌清グループの年齢構成表（Main Control）
    作成日：2024年04月04日(木)
    作成者：幌清株式会社 業務部技術課主任 及川 哲
    revision: 1.0 (First edition)
*/
(function($) {
	"use strict";
	kintone.events.on("app.record.index.show", async(event)=> {

        // カスタマイズ画面「年齢構成表（オール幌清）」でなければ抜ける
        if( event.viewName == '年齢構成図（オール幌清）' ){
            // 表示算出日を初期化
            let nowDate = new Date();
            let nowMonth = nowDate.getMonth() + 1 ;
            let ms_date = "" ;

            // アクセス日によって初期値を変える
            if( nowMonth >= 3 && nowMonth <= 8 ){
                ms_date = nowDate.getFullYear() + "-09";
                Measurement_date.value = ms_date ;
            }else{
                // 9月～12月なら翌年
                if( nowMonth >= 9 && nowMonth <= 12 ){
                    ms_date = nowDate.getFullYear() + 1 ;
                    Measurement_date.value = ms_date + "-03" ;
                }
                // 1月～2月なら今年
                else{
                    ms_date = nowDate.getFullYear() ;
                    Measurement_date.value = ms_date + "-03" ;
                }
            }

            // all_kousei(event);
            condition_open.onclick = () => {
                all_kousei(event);
            }
        }

    });
})(jQuery);
