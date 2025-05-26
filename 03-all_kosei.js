/*
    オール幌清の表示
    作成日：2024年04月25日(木)
    作成者：幌清株式会社 業務部技術課主任 及川 哲
    revision: 1.0 (First edition)
*/
async function all_kousei(event) {
    try {
        // DEFINE
        const caption_base = 950; // 表示名 x
        const age_rect = 965; // 年齢の位置 x
        const cube_size_x = 90; // 表示名の枠サイズ 縦
        const cube_size_y = 60; // 表示名の枠サイズ 縦
        const cube_x = 45; // cube 横位置（表示名）
        const cube_y = 70; // cube 縦位置（表示名）
        const start_y = 20; // 高さ初期値
        const age_x_adjustment = 30; // cube 文字 横位置（年齢）
        const cube_space_x = 7; // 表示横スペース幅

        const kosei_muroran_color = "rgb(125, 210, 210)"; // 幌清：室蘭直のcubeカラー
        const kosei_kimitsu_color = "rgb(250, 220, 100)"; // 幌清：君津直のcubeカラー
        const kosei_to_sangyo_color = "rgb(240, 240, 000)"; // 幌清：幌清→産業のcubeカラー
        const sangyo_muroran_color = "rgb(220, 180, 130)"; // 産業：直のcubeカラー
        const sangyo_kimitsu_color = "rgb(220, 180, 220)"; // 産業：直のcubeカラー
        const sangyo_to_kosei_color = "rgb(230, 230, 230)"; // 産業：産業→幌清のcubeカラー
        const sangyo_to_msr_color = "rgb(125, 255, 125)"; // 産業：産業→MSRのcubeカラー
        const total_color = "rgb(255, 200, 200)"; // 合計のcubeカラー

        /*
            以下プログラミング
        */
        let my_canvas = $("#my_canvas")[0],
            ctx = my_canvas.getContext("2d");

        // 背景色
        ctx.fillStyle = "rgb(255,255,245)";
        ctx.fillRect(0, 0, 3300, 5000);

        // クライアントの作成
        const client = new KintoneRestAPIClient();

        // 検索条件の作成
        let condition_str = make_condition();

        // エラーを検出したら
        if (condition_str == false) {
            return;
        }

        // 計測日の取得
        let msr_date = make_msrdate_str();

        // リクエストパラメータの設定
        const params = {
            app: kintone.app.getId(), // アプリID
            fields: ["$id", "表示名", "生年月日", "所属会社", "区分", "出向他"], // 取得
            condition: condition_str, // 条件
            orderBy: "生年月日 asc, $id asc", // 順番
            withCursor: true, // カーソル有無
        };

        // レコードの全件取得
        const resp = await client.record.getAllRecords(params);

        // 結果表示
        let valBirthday;
        let compareBirthday = 0;
        let j = 0;
        let muroran_cnt_max = 0;
        let kimitsu_cnt_min = 0;
        let muroran_cnt = 1;
        let kimitsu_cnt = -1;
        let rgb_val;

        let kosei_muroran_total = 0;            // 幌清 室蘭
        let kosei_to_sangyo_muroran_total = 0;  // 幌清→産業（室蘭）
        let kosei_to_sangyo_kimitsu_total = 0;  // 幌清→産業（室蘭）
        let kosei_kimitsu_total = 0;            // 幌清 君津
        let sangyo_muroran_total = 0;           // 産業 室蘭
        let sangyo_kimitsu_total = 0;           // 産業 君津
        let sangyo_to_kosei_total = 0;          // 産業→幌清（室蘭）
        let sangyo_to_msr = 0;                  // 産業→三菱（室蘭）

        let kosei_muroran_all_total = 0;            // 幌清 室蘭の合計
        let kosei_to_sangyo_muroran_all_total = 0;  // 幌清→産業（室蘭）の合計
        let kosei_to_sangyo_kimitsu_all_total = 0;  // 幌清→産業（室蘭）の合計
        let kosei_kimitsu_all_total = 0;            // 幌清 君津の合計
        let sangyo_muroran_all_total = 0;           // 産業 室蘭の合計
        let sangyo_kimitsu_all_total = 0;           // 産業 君津の合計
        let sangyo_to_kosei_all_total = 0;          // 産業→幌清（室蘭）の合計
        let sangyo_to_all_msr = 0;                  // 産業→三菱（室蘭）の合計

        // *********************************************************************
        // Cubeの室蘭・君津の総数を取得（面倒くさいけど仕方がない）
        for (let i = 0; i < resp.length; i++) {
            // 年齢を取得
            valBirthday = getYearMonth(resp[i].生年月日.value, "yy", msr_date);

            // 年齢列初期設定
            if (compareBirthday == 0) {
                compareBirthday = valBirthday;
            }

            // 年齢行がブランクでも、年齢を順序よく表示するための処理
            if (compareBirthday !== valBirthday) {
                while (compareBirthday > valBirthday) {
                    compareBirthday--;
                }

                // 右側枠数の取得
                if (muroran_cnt_max < muroran_cnt) {
                    muroran_cnt_max = muroran_cnt;
                }

                // 左側枠数の取得
                if (kimitsu_cnt_min > kimitsu_cnt) {
                    kimitsu_cnt_min = kimitsu_cnt;
                }

                // カウント初期化
                muroran_cnt = 1;
                kimitsu_cnt = -1;
            }

            // 幌清 室蘭
            if (resp[i].所属会社.value == "幌清 室蘭") {
                // 出向（産業）
                if (resp[i].出向他.value == "幌清→産業") {
                    kosei_to_sangyo_muroran_total++;
                }
                // 直
                else {
                    kosei_muroran_total++;
                }

                muroran_cnt++;
            }

            // コーセイ産業
            if (resp[i].所属会社.value == "コーセイ産業") {
                // 出向（幌清）
                if (resp[i].出向他.value == "産業→幌清") {
                    sangyo_to_kosei_total++;
                }
                // 出向（三菱）
                else if (resp[i].出向他.value == "産業（三菱）") {
                    sangyo_to_msr++;
                }
                // 直
                else {
                    sangyo_muroran_total++;
                }

                muroran_cnt++;
            }

            // 幌清 君津
            if (resp[i].所属会社.value == "幌清 君津") {
                kosei_kimitsu_total++;
                kimitsu_cnt--;
            }
        }

        // ループ外の処理
        // 右側枠数の取得
        if (muroran_cnt_max < muroran_cnt) {
            muroran_cnt_max = muroran_cnt;
        }

        // 左側枠数の取得
        if (kimitsu_cnt_min > kimitsu_cnt) {
            kimitsu_cnt_min = kimitsu_cnt;
        }

        // *********************************************************************
        // Cubeを表示していく

        // カウント初期化
        compareBirthday = 0;
        j = 0;
        muroran_cnt = 1;
        kimitsu_cnt = -1;

        kosei_muroran_total = 0;
        kosei_to_sangyo_muroran_total = 0;
        kosei_to_sangyo_kimitsu_total = 0;
        kosei_kimitsu_total = 0;
        sangyo_muroran_total = 0;
        sangyo_kimitsu_total = 0;
        sangyo_to_kosei_total = 0;
        sangyo_to_msr = 0;

        // Cube表示
        for (let i = 0; i < resp.length; i++) {
            // 年齢を取得
            valBirthday = getYearMonth(resp[i].生年月日.value, "yy", msr_date);

            // 年齢列初期設定
            if (compareBirthday == 0) {
                compareBirthday = valBirthday;
            }

            // 年齢行がブランクでも、年齢を順序よく表示するための処理
            if (compareBirthday !== valBirthday) {
                // 年齢が順序よく表示されるようにする
                let loop_flag = 0;
                while (compareBirthday > valBirthday) {
                    // フラグが立ってる時はカウント初期化
                    if (loop_flag == 1) {
                        // 集計
                        kosei_muroran_all_total = kosei_muroran_all_total + kosei_muroran_total;
                        kosei_to_sangyo_muroran_all_total = kosei_to_sangyo_muroran_all_total + kosei_to_sangyo_muroran_total;
                        kosei_to_sangyo_kimitsu_all_total = kosei_to_sangyo_kimitsu_all_total + kosei_to_sangyo_kimitsu_total;
                        kosei_kimitsu_all_total = kosei_kimitsu_all_total + kosei_kimitsu_total;
                        sangyo_muroran_all_total = sangyo_muroran_all_total + sangyo_muroran_total;
                        sangyo_kimitsu_all_total = sangyo_kimitsu_all_total + sangyo_kimitsu_total;
                        sangyo_to_kosei_all_total = sangyo_to_kosei_all_total + sangyo_to_kosei_total;
                        sangyo_to_all_msr = sangyo_to_all_msr + sangyo_to_msr;

                        // カウント初期化
                        muroran_cnt = 1;
                        kimitsu_cnt = -1;

                        kosei_muroran_total = 0;
                        kosei_to_sangyo_muroran_total = 0;
                        kosei_to_sangyo_kimitsu_total = 0;
                        kosei_kimitsu_total = 0;
                        sangyo_muroran_total = 0;
                        sangyo_kimitsu_total = 0;
                        sangyo_to_kosei_total = 0;
                        sangyo_to_msr = 0;
                    }

                    // 年齢表示
                    age_cube(ctx, compareBirthday, start_y, j, age_rect, cube_y, age_x_adjustment);

                    // トータルの表示（室蘭）
                    total_cube(ctx, kosei_muroran_total, "black", kosei_muroran_color, muroran_cnt_max + 2, j, caption_base, start_y, cube_x, cube_y, cube_size_x, cube_size_y, cube_space_x);
                    total_cube(ctx, kosei_to_sangyo_muroran_total, "black", kosei_to_sangyo_color, muroran_cnt_max + 3, j, caption_base, start_y, cube_x, cube_y, cube_size_x, cube_size_y, cube_space_x);
                    total_cube(ctx, sangyo_muroran_total, "black", sangyo_muroran_color, muroran_cnt_max + 4, j, caption_base, start_y, cube_x, cube_y, cube_size_x, cube_size_y, cube_space_x);
                    total_cube(ctx, sangyo_to_kosei_total, "black", sangyo_to_kosei_color, muroran_cnt_max + 5, j, caption_base, start_y, cube_x, cube_y, cube_size_x, cube_size_y, cube_space_x);
                    total_cube(ctx, sangyo_to_msr, "black", sangyo_to_msr_color, muroran_cnt_max + 6, j, caption_base, start_y, cube_x, cube_y, cube_size_x, cube_size_y, cube_space_x);
                    total_cube(ctx, muroran_cnt - 1, "red", total_color, muroran_cnt_max + 7, j, caption_base, start_y, cube_x, cube_y, cube_size_x, cube_size_y, cube_space_x);

                    // トータルの表示（君津）
                    total_cube(ctx, Math.abs(kimitsu_cnt) - 1, "red", total_color, kimitsu_cnt_min - 2, j, caption_base, start_y, cube_x, cube_y, cube_size_x, cube_size_y, cube_space_x);
                    total_cube(ctx, sangyo_kimitsu_total, "black", sangyo_kimitsu_color, kimitsu_cnt_min - 3, j, caption_base, start_y, cube_x, cube_y, cube_size_x, cube_size_y, cube_space_x);
                    total_cube(ctx, kosei_kimitsu_total, "black", kosei_kimitsu_color, kimitsu_cnt_min - 4, j, caption_base, start_y, cube_x, cube_y, cube_size_x, cube_size_y, cube_space_x);

                    compareBirthday--;
                    j++;
                    loop_flag = 1;
                }

                // 集計
                kosei_muroran_all_total = kosei_muroran_all_total + kosei_muroran_total;
                kosei_to_sangyo_muroran_all_total = kosei_to_sangyo_muroran_all_total + kosei_to_sangyo_muroran_total;
                kosei_to_sangyo_kimitsu_all_total = kosei_to_sangyo_kimitsu_all_total + kosei_to_sangyo_kimitsu_total;
                kosei_kimitsu_all_total = kosei_kimitsu_all_total + kosei_kimitsu_total;
                sangyo_muroran_all_total = sangyo_muroran_all_total + sangyo_muroran_total;
                sangyo_kimitsu_all_total = sangyo_kimitsu_all_total + sangyo_kimitsu_total;
                sangyo_to_kosei_all_total = sangyo_to_kosei_all_total + sangyo_to_kosei_total;
                sangyo_to_all_msr = sangyo_to_all_msr + sangyo_to_msr;

                // カウント初期化
                muroran_cnt = 1;
                kimitsu_cnt = -1;

                kosei_muroran_total = 0;
                kosei_to_sangyo_muroran_total = 0;
                kosei_to_sangyo_kimitsu_total = 0;
                kosei_kimitsu_total = 0;
                sangyo_muroran_total = 0;
                sangyo_kimitsu_total = 0;
                sangyo_to_kosei_total = 0;
                sangyo_to_msr = 0;
            }

            // 誕生日表記をYYYY.MMに変更
            let birth_year_month = resp[i].生年月日.value.substring(0, resp[i].生年月日.value.length - 3);
            birth_year_month = birth_year_month.replace("-", ".");

            // 幌清 室蘭
            if (resp[i].所属会社.value == "幌清 室蘭") {
                // 出向（産業）
                if (resp[i].出向他.value == "幌清→産業") {
                    rgb_val = kosei_to_sangyo_color;
                    kosei_to_sangyo_muroran_total++;
                }
                // 直
                else {
                    rgb_val = kosei_muroran_color;
                    kosei_muroran_total++;
                }

                cube(ctx, resp[i].表示名.value, birth_year_month, rgb_val, muroran_cnt, j, caption_base, start_y, cube_x, cube_y, cube_size_x, cube_size_y, cube_space_x);
                muroran_cnt++;
            }

            // コーセイ産業
            if (resp[i].所属会社.value == "コーセイ産業") {
                // 出向（幌清）室蘭の意
                if (resp[i].出向他.value == "産業→幌清") {
                    rgb_val = sangyo_to_kosei_color;
                    sangyo_to_kosei_total++;
                }
                // 出向（三菱）
                else if (resp[i].出向他.value == "産業（三菱）") {
                    rgb_val = sangyo_to_msr_color;
                    sangyo_to_msr++;
                }
                // 直
                else {
                    rgb_val = sangyo_muroran_color;
                    sangyo_muroran_total++;
                }

                cube(ctx, resp[i].表示名.value, birth_year_month, rgb_val, muroran_cnt, j, caption_base, start_y, cube_x, cube_y, cube_size_x, cube_size_y, cube_space_x);
                muroran_cnt++;
            }

            // 幌清 君津
            if (resp[i].所属会社.value == "幌清 君津") {
                kosei_kimitsu_total++;

                rgb_val = kosei_kimitsu_color;
                cube(ctx, resp[i].表示名.value, birth_year_month, rgb_val, kimitsu_cnt, j, caption_base, start_y, cube_x, cube_y, cube_size_x, cube_size_y, cube_space_x);
                kimitsu_cnt--;
            }
        }

        // ******************************************************************************
        // ループ外 残1回分の処理
        // 年齢表示
        age_cube(ctx, compareBirthday, start_y, j, age_rect, cube_y, age_x_adjustment);

        // トータルの表示（室蘭）
        total_cube(ctx, kosei_muroran_total, "black", kosei_muroran_color, muroran_cnt_max + 2, j, caption_base, start_y, cube_x, cube_y, cube_size_x, cube_size_y, cube_space_x);
        total_cube(ctx, kosei_to_sangyo_muroran_total, "black", kosei_to_sangyo_color, muroran_cnt_max + 3, j, caption_base, start_y, cube_x, cube_y, cube_size_x, cube_size_y, cube_space_x);
        total_cube(ctx, sangyo_muroran_total, "black", sangyo_muroran_color, muroran_cnt_max + 4, j, caption_base, start_y, cube_x, cube_y, cube_size_x, cube_size_y, cube_space_x);
        total_cube(ctx, sangyo_to_kosei_total, "black", sangyo_to_kosei_color, muroran_cnt_max + 5, j, caption_base, start_y, cube_x, cube_y, cube_size_x, cube_size_y, cube_space_x);
        total_cube(ctx, sangyo_to_msr, "black", sangyo_to_msr_color, muroran_cnt_max + 6, j, caption_base, start_y, cube_x, cube_y, cube_size_x, cube_size_y, cube_space_x);
        total_cube(ctx, muroran_cnt - 1, "red", total_color, muroran_cnt_max + 7, j, caption_base, start_y, cube_x, cube_y, cube_size_x, cube_size_y, cube_space_x);

        // トータルの表示（君津）
        total_cube(ctx, Math.abs(kimitsu_cnt) - 1, "red", total_color, kimitsu_cnt_min - 2, j, caption_base, start_y, cube_x, cube_y, cube_size_x, cube_size_y, cube_space_x);
        total_cube(ctx, sangyo_kimitsu_total, "black", sangyo_kimitsu_color, kimitsu_cnt_min - 3, j, caption_base, start_y, cube_x, cube_y, cube_size_x, cube_size_y, cube_space_x);
        total_cube(ctx, kosei_kimitsu_total, "black", kosei_kimitsu_color, kimitsu_cnt_min - 4, j, caption_base, start_y, cube_x, cube_y, cube_size_x, cube_size_y, cube_space_x);

        // 背景の表示
        bg_draw(ctx, age_rect, caption_base, start_y, j, cube_x, cube_y, cube_size_x, cube_size_y, cube_space_x, muroran_cnt_max, kimitsu_cnt_min);

        // トータルの表題（室蘭）
        total_cube(ctx, "幌清（直）", "black", kosei_muroran_color, muroran_cnt_max + 2, -1, caption_base, start_y, cube_x, cube_y, cube_size_x, cube_size_y, cube_space_x);
        total_cube(ctx, "幌清→産業", "black", kosei_to_sangyo_color, muroran_cnt_max + 3, -1, caption_base, start_y, cube_x, cube_y, cube_size_x, cube_size_y, cube_space_x);
        total_cube(ctx, "産業（直）", "black", sangyo_muroran_color, muroran_cnt_max + 4, -1, caption_base, start_y, cube_x, cube_y, cube_size_x, cube_size_y, cube_space_x);
        total_cube(ctx, "産業→幌清", "black", sangyo_to_kosei_color, muroran_cnt_max + 5, -1, caption_base, start_y, cube_x, cube_y, cube_size_x, cube_size_y, cube_space_x);
        total_cube(ctx, "産業（三菱）", "black", sangyo_to_msr_color, muroran_cnt_max + 6, -1, caption_base, start_y, cube_x, cube_y, cube_size_x, cube_size_y, cube_space_x);
        total_cube(ctx, "合計", "red", total_color, muroran_cnt_max + 7, -1, caption_base, start_y, cube_x, cube_y, cube_size_x, cube_size_y, cube_space_x);

        // トータルの表題（君津）
        total_cube(ctx, "合計", "red", total_color, kimitsu_cnt_min - 2, -1, caption_base, start_y, cube_x, cube_y, cube_size_x, cube_size_y, cube_space_x);
        total_cube(ctx, "産業（直）", "black", sangyo_kimitsu_color, kimitsu_cnt_min - 3, -1, caption_base, start_y, cube_x, cube_y, cube_size_x, cube_size_y, cube_space_x);
        total_cube(ctx, "幌清（直）", "black", kosei_kimitsu_color, kimitsu_cnt_min - 4, -1, caption_base, start_y, cube_x, cube_y, cube_size_x, cube_size_y, cube_space_x);

        // 集計表の表示
        spreadsheet(ctx, start_y, cube_y, cube_size_y, j, 
            kosei_muroran_all_total, kosei_to_sangyo_muroran_all_total, kosei_to_sangyo_kimitsu_all_total, kosei_kimitsu_all_total,
            sangyo_muroran_all_total, sangyo_kimitsu_all_total, sangyo_to_kosei_all_total, sangyo_to_all_msr );

    } catch (e) {
        alert("レコード情報取得時にエラーが発生しました。");
        console.log(e);
        return;
    }

    return event;
}

/*
    背景の表示
*/
function bg_draw(ctx, age_rect, caption_base, start_y, j, cube_x, cube_y, cube_size_x, cube_size_y, cube_space_x, muroran_cnt_max, kimitsu_cnt_min) {
    // 罫線
    ctx.lineCap = "round";
    ctx.strokeStyle = "rgb(210,210,210)";
    ctx.lineWidth = 0;
    ctx.setLineDash([3, 2]);

    ctx.beginPath();

    // 長さ
    let len = start_y + cube_y + cube_y * (j + 3) - (cube_y - cube_size_y) / 2 + 1;

    // 年齢（縦罫線 右側）
    ctx.moveTo(age_rect + 73, 5);
    ctx.lineTo(age_rect + 73, len);
    ctx.stroke();

    // 年齢（縦罫線 左側）
    ctx.moveTo(age_rect - 10, 5);
    ctx.lineTo(age_rect - 10, len);
    ctx.stroke();

    // 枠の仕切り（縦罫線 右側）
    for (let i = 1; i <= muroran_cnt_max + 6; i++) {
        ctx.moveTo(caption_base + cube_x + (cube_size_x + cube_space_x + 2) / 2 + (cube_size_x + cube_space_x) * i, 5);
        ctx.lineTo(caption_base + cube_x + (cube_size_x + cube_space_x + 2) / 2 + (cube_size_x + cube_space_x) * i, len);
        ctx.stroke();
    }

    // 枠の仕切り（縦罫線左側）
    for (let i = -2; i >= kimitsu_cnt_min - 4; i--) {
        ctx.moveTo(caption_base + cube_x + (cube_size_x + cube_space_x + 2) / 2 + (cube_size_x + cube_space_x) * i, 5);
        ctx.lineTo(caption_base + cube_x + (cube_size_x + cube_space_x + 2) / 2 + (cube_size_x + cube_space_x) * i, len);
        ctx.stroke();
    }
    ctx.closePath();

    // 枠の仕切り（横罫線）
    ctx.beginPath();
    ctx.setLineDash([2, 2]);
    for (let i = 0; i <= j + 3; i++) {
        ctx.moveTo(0, start_y + cube_y + cube_y * i - (cube_y - cube_size_y) / 2 + 1);
        ctx.lineTo(3300, start_y + cube_y + cube_y * i - (cube_y - cube_size_y) / 2 + 1);
        ctx.stroke();
    }
    ctx.closePath();
}

/*
    年齢を出力する箱
*/
function age_cube(ctx, caption, start_y, y, age_rect, cube_y, age_x_adjustment) {
    // 矩形書式
    ctx.fillStyle = "rgb(255,200,200)";
    ctx.shadowColor = "black";
    ctx.shadowBlur = 3;
    ctx.shadowOffsetX = 2;
    ctx.shadowOffsetY = 2;

    // 矩形描画
    ctx.fillRect(age_rect, start_y + cube_y + cube_y * y, 60, 60);

    // テキスト描画
    ctx.font = "16px Meiryo UI";
    ctx.textAlign = "center";
    ctx.fillStyle = "black";
    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;

    // 表示名
    ctx.fillText(caption, age_rect + age_x_adjustment, start_y + cube_y + 35 + cube_y * y);

    return;
}

/*
    表示名を出力する箱
*/
function cube(ctx, caption, birthday, cube_color, x, y, caption_base, start_y, cube_x, cube_y, cube_size_x, cube_size_y, cube_space_x) {
    // 矩形書式
    ctx.fillStyle = cube_color;
    ctx.shadowColor = "black";
    ctx.shadowBlur = 3;
    ctx.shadowOffsetX = 2;
    ctx.shadowOffsetY = 2;

    // 矩形描画
    ctx.fillRect(caption_base + (cube_size_x + cube_space_x) * x, start_y + cube_y + cube_y * y, cube_size_x, cube_size_y);

    // テキスト描画
    ctx.font = "16px Meiryo UI";
    ctx.textAlign = "center";
    ctx.fillStyle = "black";
    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;

    // 表示名
    ctx.fillText(caption, caption_base + cube_x + (cube_size_x + cube_space_x) * x, start_y + cube_y + 25 + cube_y * y);

    // 生年月
    ctx.font = "12px Meiryo UI";
    ctx.fillText(birthday, caption_base + cube_x + (cube_size_x + cube_space_x) * x, start_y + cube_y + 45 + cube_y * y);

    return;
}

/*
    集計
*/
function total_cube(ctx, caption, font_color, cube_color, x, y, caption_base, start_y, cube_x, cube_y, cube_size_x, cube_size_y, cube_space_x) {
    // 矩形書式
    ctx.fillStyle = cube_color;
    ctx.shadowColor = "black";
    ctx.shadowBlur = 3;
    ctx.shadowOffsetX = 2;
    ctx.shadowOffsetY = 2;

    // 矩形描画
    ctx.fillRect(caption_base + (cube_size_x + cube_space_x) * x, start_y + cube_y + cube_y * y, cube_size_x, cube_size_y);

    // テキスト描画
    ctx.font = "12px Meiryo UI";
    ctx.textAlign = "center";
    ctx.fillStyle = font_color;
    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;

    // 表示名
    ctx.fillText(caption, caption_base + cube_x + (cube_size_x + cube_space_x) * x, start_y + cube_y + 35 + cube_y * y);

    return;
}

/*
    年の選び方のガイダンス
*/
function attention_msg() {
    alert("年を選ぶときはマウスのコロコロかスクロールして下さい");
}

/*
    検索月の月末を取得
*/
function make_msrdate_str() {
    // 検索月をinputより取得
    let date = Measurement_date.value + "-01";

    // 月末を取得するため日付型に変換
    let moji_date = new Date(date);

    // 月末を取得
    moji_date.setMonth(moji_date.getMonth() + 1, 0);

    // moji_dateより年月日を取得する
    let year = moji_date.getFullYear().toString().padStart(4, "0");
    let month = (moji_date.getMonth() + 1).toString().padStart(2, "0");
    let day = moji_date.getDate().toString().padStart(2, "0");

    // YYYY-MM-DD形式にする
    let dateText = year + "-" + month + "-" + day;

    return dateText;
}


/*
    集計表
*/
function spreadsheet(ctx, start_y, cube_y, cube_size_y, j,
    kosei_muroran_all_total, kosei_to_sangyo_muroran_all_total, kosei_to_sangyo_kimitsu_all_total, kosei_kimitsu_all_total,
    sangyo_muroran_all_total, sangyo_kimitsu_all_total, sangyo_to_kosei_all_total, sangyo_to_all_msr
) {
    // 長さ
    let len = start_y + cube_y + cube_y * (j + 3) - (cube_y - cube_size_y) / 2 + 1;
    let choku_muroran = kosei_muroran_all_total + kosei_to_sangyo_muroran_all_total;
    let choku_kimitsu = kosei_kimitsu_all_total + kosei_to_sangyo_kimitsu_all_total;
    let sangyo_muroran = sangyo_muroran_all_total + sangyo_to_kosei_all_total + sangyo_to_all_msr ;
    let sangyo_kimitsu = 0 ;

    // font設定
    ctx.font = "16px Meiryo UI";
    ctx.fillStyle = "black";
    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;

    console.log("len: ", len);

    // 直
    ctx.textAlign = "left";
    ctx.fillText("室蘭", 340, len + 65);
    ctx.fillText("君津", 410, len + 65);
    ctx.fillText("合計", 480, len + 65);

    // 直：表題
    ctx.textAlign = "left";
    ctx.fillText("直", 100, len + 65);
    ctx.fillText("社員:", 150, len + 100);
    ctx.fillText("産業（室蘭）出向:", 150, len + 135);
    ctx.fillText("産業（君津）出向:", 150, len + 170);
    ctx.fillText("計:", 150, len + 205);

    // 直：室蘭
    ctx.textAlign = "right";
    ctx.fillText(kosei_muroran_all_total, 370, len + 100);           // 幌清直（室蘭）
    ctx.fillText(kosei_to_sangyo_muroran_all_total, 370, len + 135); // 産業（室蘭）出向
    ctx.fillText(0, 370, len + 170);                                 // 産業（君津）出向
    ctx.fillText(choku_muroran, 370, len + 205);                     // 幌清合計（室蘭）

    // 直：君津
    ctx.fillText(kosei_kimitsu_all_total, 440, len + 100);           // 幌清直（君津）
    ctx.fillText(0, 440, len + 135);                                 // 産業（室蘭）出向
    ctx.fillText(kosei_to_sangyo_kimitsu_all_total, 440, len + 170); // 産業（君津）出向
    ctx.fillText(choku_kimitsu, 440, len + 205);                     // 幌清合計（君津）

    // 直：合計
    ctx.fillText(kosei_muroran_all_total + kosei_kimitsu_all_total, 510, len + 100); // 幌清直（君津）
    ctx.fillText(kosei_to_sangyo_muroran_all_total, 510, len + 135);                 // 産業（室蘭）出向
    ctx.fillText(kosei_to_sangyo_kimitsu_all_total, 510, len + 170);                 // 産業（君津）出向
    ctx.fillText(choku_muroran + choku_kimitsu, 510, len + 205);                     // 幌清合計

    // 仕切り線
    // 罫線
    ctx.lineCap = "round";
    ctx.strokeStyle = "rgb(150,210,150)";
    ctx.lineWidth = 1;
    ctx.setLineDash([0, 0]);

    ctx.beginPath();

    ctx.moveTo(560, len + 30);
    ctx.lineTo(560, len + 250);
    ctx.stroke();

    ctx.closePath();

    // 協
    ctx.textAlign = "left";
    ctx.fillText("室蘭", 840, len + 65);
    ctx.fillText("君津", 910, len + 65);
    ctx.fillText("合計", 980, len + 65);

    // 協：表題
    ctx.textAlign = "left";
    ctx.fillText("協", 600, len + 65);
    ctx.fillText("コーセイ産業:", 650, len + 100);
    ctx.fillText("幌清（室蘭）出向:", 650, len + 135);
    ctx.fillText("幌清（君津）出向:", 650, len + 170);
    ctx.fillText("MSR（室蘭）出向:", 650, len + 205);
    ctx.fillText("計:", 650, len + 240);

    // 協：室蘭
    ctx.textAlign = "right";
    ctx.fillText(sangyo_muroran_all_total, 870, len + 100);  // 産業直（室蘭）
    ctx.fillText(sangyo_to_kosei_all_total, 870, len + 135); // 幌清（室蘭）出向
    ctx.fillText("-", 870, len + 170);                       // 幌清（君津）出向
    ctx.fillText(sangyo_to_all_msr, 870, len + 205);         // MSR（室蘭）出向
    ctx.fillText(sangyo_muroran, 870, len + 240);            // 幌清合計（室蘭）

    // 協：君津
    ctx.fillText(sangyo_kimitsu_all_total, 940, len + 100);  // 幌清直（君津）
    ctx.fillText("-", 940, len + 135);                       // 幌清（室蘭）出向
    ctx.fillText("-", 940, len + 170);                       // 幌清（君津）出向
    ctx.fillText("-", 940, len + 205);                       // MSR（君津）出向
    ctx.fillText(sangyo_kimitsu, 940, len + 240);            // 幌清合計（君津）

    // 協：合計
    ctx.fillText(sangyo_muroran_all_total + sangyo_kimitsu_all_total, 1010, len + 100); // 幌清直（君津）
    ctx.fillText(sangyo_to_kosei_all_total, 1010, len + 135);                           // 産業（室蘭）出向
    ctx.fillText("-", 1010, len + 170);                                                 // 産業（君津）出向
    ctx.fillText(sangyo_to_all_msr, 1010, len + 205);                                   // MSR（君津）出向
    ctx.fillText(sangyo_muroran + sangyo_kimitsu, 1010, len + 240);                     // 幌清合計

}
