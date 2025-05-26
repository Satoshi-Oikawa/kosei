/*
    幌清グループ全員の年齢リスト表示
    作成日：2024年04月04日(木)
    作成者：幌清株式会社 業務部技術課主任 及川 哲
    revision: 1.0 (First edition)
*/
(function($) {
	"use strict";
	kintone.events.on("app.record.index.show", async(event)=> {

		/*カスタマイズビューの一覧でなければリターンする*/
		if(event.viewId !== 5775554 ) {
			return;
		}

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
			age_list(event);
		}

	});
})(jQuery);


async function age_list(event){

	// クライアントの作成
	const client = new KintoneRestAPIClient();

	// 検索条件の作成
	let condition_str = make_condition();

	// エラーを検出したら
	if (condition_str == false) {
		return;
	}
	
	// リクエストパラメータの設定
	const params = {
		app: kintone.app.getId(),								// アプリID
		fields: ['$id', '氏名', '生年月日', '所属会社', '区分'],  // 取得
		condition: condition_str, 								// 条件
		orderBy: '生年月日 asc, $id asc',						 // 順番
		withCursor: true										// カーソル有無
	};

	// レコードの全件取得
	const resp = await client.record.getAllRecords(params);

	// 取得できたレコードが0件なら下記表示を行なう
	if(resp.totalCount === "0") {
		$("#contents").html("表示するレコードがありません。");
		return;
	}

	// 初期化
	$("#my-tbody").html("");
	$("#contents").html("");

	// 取得日の明示
	$("#contents").html(Measurement_date.value+"時点のものを表示");

	// テーブルヘッダー書き出し
	let head = "<tr>" +
				"<td class='my-head'>氏名</td>" +
				"<td class='my-head'>生年月日</td>" +
				"<td class='my-head'>年齢</td>" +
				"<td class='my-head'>所属会社</td>" +
				"<td class='my-head'>区分</td>" +
				"</tr>"

	$("#my-tbody").append(head);

	// 結果表示
	let html;
	let valBirthday ;
	for (let i = 0; i < resp.length; i++) {
			// 年齢を取得
			valBirthday = getYearMonth(resp[i].生年月日.value, 'yy', Measurement_date.value);

			html = "<tr>" +
					"<td class='my-td'>" + resp[i].氏名.value + "</td>" +
					"<td class='my-td'>" + resp[i].生年月日.value + "</td>" +
					"<td class='my-td'>" + valBirthday + "</td>" +
					"<td class='my-td'>" + resp[i].所属会社.value + "</td>" +
					"<td class='my-td'>" + resp[i].区分.value + "</td>" +
					"</tr>"

			$("#my-tbody").append(html);

	}

	return event ;
}
