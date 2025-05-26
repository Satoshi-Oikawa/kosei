/*
	指定時点での年齢計算
*/
function getYearMonth(dtDate, typeDate, Measurement_date) {
	var dtToday = new Date();
	var dtFrom = new Date(dtDate);

	switch (typeDate) {
		case 'yy':

			var intDays = (Date.parse(Measurement_date) - Date.parse(dtDate)) / 1000 / 60 / 60 / 24; // シリアル値の単位はミリ秒
			return Math.floor(intDays / 365.25);


		case 'yymm':

			var intYear = dtToday.getFullYear() - dtFrom.getFullYear();
			var intMonth = dtToday.getMonth() - dtFrom.getMonth();

			if (intMonth < 0) {
				intYear--;
				intMonth += 12;
			}
			return intYear + "- " + intMonth;

		default:
			return null;
	}
}


/*
    condition文字列の作成
*/
function make_condition() {
    // 検索条件の作成
    let condition_str = "";
    let tmp_str = "";

    // **************************************************************************
    // 対象者氏名
    if (ByName.value !== "") {
        // 特殊文字の削除削除
        const targetChars = [",", ".", "'", '"', ";", ":", "!"];
        ByName.value = [...ByName.value].filter((char) => !targetChars.includes(char)).join("");

        // conditionに結合
        condition_str = condition_str + ' and 氏名 like "' + ByName.value + '"';
    }

    // **************************************************************************
    // 所属会社
    // 室蘭
    tmp_str = "";
    if (display_kosei_muroran.checked == true) {
        tmp_str = tmp_str + ', "幌清 室蘭"';
    }

    // 産業
    if (display_kosei_kimitsu.checked == true) {
        tmp_str = tmp_str + ', "幌清 君津"';
    }

    // 君津
    if (display_sangyo.checked == true) {
        tmp_str = tmp_str + ', "コーセイ産業"';
    }

    // 表示会社が無選択ならエラー
    if (tmp_str == "") {
        alert("幌清（室蘭）・幌清（君津）・コーセイ産業が全て未選択です");
        return false;
    }

    // 行頭の文字列を削除
    tmp_str = tmp_str.slice(2);

    // conditionに結合
    condition_str = condition_str + " and 所属会社 in (" + tmp_str + ")";

    // **************************************************************************
    // 労働場所
    // 現場がon
    tmp_str = "";
    if (on_site.checked == true) {
        tmp_str = tmp_str + ', "現場"';
    }

    // 事務所がon
    if (office.checked == true) {
        tmp_str = tmp_str + ', "事務所"';
    }

    // 労働場所が全て未選択ならエラー
    if (tmp_str == "") {
        alert("現場・事務所が全て未選択です");
        return false;
    }

    // 行頭の文字列を削除
    tmp_str = tmp_str.slice(2);

    // conditionに結合
    condition_str = condition_str + " and 区分 in (" + tmp_str + ")";

    // **************************************************************************
    // 出向他
    // 出向なしがon
    tmp_str = "";
    if (No_secondment.checked == true) {
        tmp_str = tmp_str + ', "出向なし"';
    }

    // 幌清→産業がon
    if (kosei_to_sangyo.checked == true) {
        tmp_str = tmp_str + ', "幌清→産業"';
    }

    // 産業→幌清がon
    if (sangyo_to_kosei.checked == true) {
        tmp_str = tmp_str + ', "産業→幌清"';
    }

    // 産業（三菱）がon
    if (sangyo_to_msr.checked == true) {
        tmp_str = tmp_str + ', "産業（三菱）"';
    }

    // 行頭の文字列を削除
    tmp_str = tmp_str.slice(2);

    // conditionに結合
    condition_str = condition_str + " and 出向他 in (" + tmp_str + ")";

    // **************************************************************************
    // 行頭の「 and 」を削除
    condition_str = condition_str.slice(5);

    return condition_str;
}
