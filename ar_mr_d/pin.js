import { db } from './db.js';

let pinLatitude = 35.67866;
let pinLongitude = 139.80809;

///////////////////////////////////////////////////////////////////////////////////////////////////////////////

//初期値.
let tx = 0;
let ty = 0;
let angle = 0;

const geoOne = () => {
    //'Promise'は関数の成功を"約束"します. その約束が守られたら'resolve', 破られたら'reject'(今回は使わないけれど)となり、その内容を関数の外でも利用できるようにします.
    //(※これらは"非同期処理"といい、関数が実行されるのを"待って"もらう為に行っています (JavaScriptでは基本的に待ってくれません...)).
    //(※具体的にはこの処理がないと、ユーザーがボタンを押した際に「緯度」や「経度」を取得して計算しますが、その取得前に計算を実行し始めた挙句 "「緯度」や「経度」がない！！" というエラーが発生します...).
    //(※ただ、恐らく普通にJavaScriptを使う上で最も難しいところなので、解らない人はとりあえずスルーしてください...).
    return new Promise((resolve, reject) => {
    if (navigator.geolocation) {
        //GPSから「緯度」「経度」「高度」「精度」を取得する.
        navigator.geolocation.getCurrentPosition(
    
        function(position) {
        let lato = position.coords.latitude;
        let lngo = position.coords.longitude;
        let acc = position.coords.accuracy;

        console.log(lato);
        console.log(lngo);
        console.log(acc);

        resolve({lato, lngo, acc});
    
        },
        function(error) {
            // 位置情報の取得に失敗した場合の処理
            switch (error.code) {
            case error.PERMISSION_DENIED:
                alert("位置情報が利用できません。");
                console.error("ユーザーが位置情報の取得を拒否しました。");
                break;
            case error.POSITION_UNAVAILABLE:
                alert("位置情報が利用できません。");
                break;
            case error.TIMEOUT:
                alert("タイムアウトしました。");
                break;
            case error.UNKNOWN_ERROR:
                alert("不明なエラーが発生しました。");
                break;
            }
        }
        )
    } else {
        alert("お使いのブラウザはGPSの取得機能がございません。")
    };
});
};

///////////////////////////////////////////////////////////////////////////////////////////////////////////////

const photo = async(lato, lngo, acc) => {
console.log("lato: " + lato);
console.log("lngo: " + lngo);
console.log("acc: " + acc);

//変数を定義.
let lng0 = 0;
let lat0 = 0;
let location = 0;
let third_mesh = '';

//市区町村メッシュ・コードを算出.
const divmod = (x, y) => {
    const quotient = Math.floor(x / y);
    const remainder = x % y;
    return [quotient, remainder];
}

const latlon2mesh = (lat, lon) => {
    // 1次メッシュ上2けた
    const quotient_lat = Math.floor(lat * 60 / 40);
    const remainder_lat = Math.floor(lat * 60 % 40);
    const first2digits = quotient_lat.toString().slice(0, 2);

    // 1次メッシュ下2けた
    const last2digits = (lon - 100).toString().slice(0, 2);
    const remainder_lon = lon - parseInt(last2digits, 10) - 100;

    // 1次メッシュ
    const first_mesh = first2digits + last2digits;

    // 2次メッシュ上1けた
    const [first1digit, remainder_lat_2] = divmod(remainder_lat, 5);

    // 2次メッシュ下1けた
    const [last1digit, remainder_lon_2] = divmod(remainder_lon * 60, 7.5);

    // 2次メッシュ
    const second_mesh = first_mesh + first1digit.toString().slice(0, 1) + last1digit.toString().slice(0, 1);

    // 3次メッシュ上1けた
    const first1digit_2 = divmod(remainder_lat_2 * 60, 30);

    // 3次メッシュ下1けた
    const last1digit_2 = divmod(remainder_lon_2 * 60, 45);

    // 3次メッシュ
    third_mesh = second_mesh + first1digit_2.toString().slice(0, 1) + last1digit_2.toString().slice(0, 1);

    return { first_mesh, second_mesh, third_mesh };

}

console.log("1次メッシュ:" + latlon2mesh(lato, lngo).first_mesh);
console.log("2次メッシュ:" + latlon2mesh(lato, lngo).second_mesh);
console.log("3次メッシュ:" + latlon2mesh(lato, lngo).third_mesh);

location = await db(third_mesh);
console.log("系番号: " + location.number);

//系番号から原点座標を判定.
if (location.number === 1) {
    lat0 = 33.000000;  //平面直角座標系原点(緯度).
    lng0 = 129.500000; //平面直角座標系原点(経度).
    console.log("平面直角座標第I系原点(緯度,10進法): " + lat0);
    console.log("平面直角座標第I系原点(経度,10進法): " + lng0);
} else if (location.number === 2) {
    lat0 = 33.000000;  //平面直角座標系原点(緯度).
    lng0 = 131.000000; //平面直角座標系原点(経度).
    console.log("平面直角座標第II系原点(緯度,10進法): " + lat0);
    console.log("平面直角座標第II系原点(経度,10進法): " + lng0);
} else if (location.number === 3) {
    lat0 = 33.000000;     //平面直角座標系原点(緯度).
    lng0 = 132 + (10/60); //平面直角座標系原点(経度).
    console.log("平面直角座標第III系原点(緯度,10進法): " + lat0);
    console.log("平面直角座標第III系原点(経度,10進法): " + lng0);
} else if (location.number === 4) {
    lat0 = 33.000000;  //平面直角座標系原点(緯度).
    lng0 = 133.500000; //平面直角座標系原点(経度).
    console.log("平面直角座標第IV系原点(緯度,10進法): " + lat0);
    console.log("平面直角座標第IV系原点(経度,10進法): " + lng0);
} else if (location.number === 5) {
    lat0 = 36.000000;     //平面直角座標系原点(緯度).
    lng0 = 134 + (20/60); //平面直角座標系原点(経度).
    console.log("平面直角座標第V系原点(緯度,10進法): " + lat0);
    console.log("平面直角座標第V系原点(経度,10進法): " + lng0);
} else if (location.number === 6) {
    lat0 = 36.000000;  //平面直角座標系原点(緯度).
    lng0 = 136.000000; //平面直角座標系原点(経度).
    console.log("平面直角座標第VI系原点(緯度,10進法): " + lat0);
    console.log("平面直角座標第VI系原点(経度,10進法): " + lng0);
} else if (location.number === 7) {
    lat0 = 36.000000;     //平面直角座標系原点(緯度).
    lng0 = 137 + (10/60); //平面直角座標系原点(経度).
    console.log("平面直角座標第VII系原点(緯度,10進法): " + lat0);
    console.log("平面直角座標第VII系原点(経度,10進法): " + lng0);
} else if (location.number === 8) {
    lat0 = 36.000000;  //平面直角座標系原点(緯度).
    lng0 = 138.500000; //平面直角座標系原点(経度).
    console.log("平面直角座標第VIII系原点(緯度,10進法): " + lat0);
    console.log("平面直角座標第VIII系原点(経度,10進法): " + lng0);
} else if (location.number === 9) {
    lat0 = 36.000000;     //平面直角座標系原点(緯度).
    lng0 = 139 + (50/60); //平面直角座標系原点(経度).
    console.log("平面直角座標第IX系原点(緯度,10進法): " + lat0);
    console.log("平面直角座標第IX系原点(経度,10進法): " + lng0);
} else if (location.number === 10) {
    lat0 = 40.000000;     //平面直角座標系原点(緯度).
    lng0 = 140 + (50/60); //平面直角座標系原点(経度).
    console.log("平面直角座標第X系原点(緯度,10進法): " + lat0);
    console.log("平面直角座標第X系原点(経度,10進法): " + lng0);
} else if (location.number === 11) {
    lat0 = 44.000000;  //平面直角座標系原点(緯度).
    lng0 = 140.250000; //平面直角座標系原点(経度).
    console.log("平面直角座標第XI系原点(緯度,10進法): " + lat0);
    console.log("平面直角座標第XI系原点(経度,10進法): " + lng0);
} else if (location.number === 12) {
    lat0 = 44.000000;  //平面直角座標系原点(緯度).
    lng0 = 142.250000; //平面直角座標系原点(経度).
    console.log("平面直角座標第XII系原点(緯度,10進法): " + lat0);
    console.log("平面直角座標第XII系原点(経度,10進法): " + lng0);
} else if (location.number === 13) {
    lat0 = 44.000000;  //平面直角座標系原点(緯度).
    lng0 = 144.250000; //平面直角座標系原点(経度).
    console.log("平面直角座標第XIII系原点(緯度,10進法): " + lat0);
    console.log("平面直角座標第XIII系原点(経度,10進法): " + lng0);
} else if (location.number === 14) {
    lat0 = 26.000000;  //平面直角座標系原点(緯度).
    lng0 = 142.000000; //平面直角座標系原点(経度).
    console.log("平面直角座標第XIV系原点(緯度,10進法): " + lat0);
    console.log("平面直角座標第XIV系原点(経度,10進法): " + lng0);
} else if (location.number === 15) {
    lat0 = 26.000000;  //平面直角座標系原点(緯度).
    lng0 = 127.500000; //平面直角座標系原点(経度).
    console.log("平面直角座標第XV系原点(緯度,10進法): " + lat0);
    console.log("平面直角座標第XV系原点(経度,10進法): " + lng0);
} else if (location.number === 16) {
    lat0 = 26.000000;  //平面直角座標系原点(緯度).
    lng0 = 124.000000; //平面直角座標系原点(経度).
    console.log("平面直角座標第XVI系原点(緯度,10進法): " + lat0);
    console.log("平面直角座標第XVI系原点(経度,10進法): " + lng0);
} else if (location.number === 17) {
    lat0 = 26.000000;  //平面直角座標系原点(緯度).
    lng0 = 131.000000; //平面直角座標系原点(経度).
    console.log("平面直角座標第XVII系原点(緯度,10進法): " + lat0);
    console.log("平面直角座標第XVII系原点(経度,10進法): " + lng0);
} else if (location.number === 18) {
    lat0 = 20.000000;  //平面直角座標系原点(緯度).
    lng0 = 136.000000; //平面直角座標系原点(経度).
    console.log("平面直角座標第XVIII系原点(緯度,10進法): " + lat0);
    console.log("平面直角座標第XVIII系原点(経度,10進法): " + lng0);
} else if (location.number === 19) {
    lat0 = 26.000000;  //平面直角座標系原点(緯度).
    lng0 = 154.000000; //平面直角座標系原点(経度).
    console.log("平面直角座標第XIX系原点(緯度,10進法): " + lat0);
    console.log("平面直角座標第XIX系原点(経度,10進法): " + lng0);
} else {
    console.log("系番号を判定できませんでした...")
};

//平面直角座標系_原点変換(第8系, 世界測地系).
const changeOne = (lat, lng, lat0, lng0) => {
//緯度経度 → 平面直角座標の変換プログラム.
//以下の国土地理院のサイトの計算式を参照.
//https://vldb.gsi.go.jp/sokuchi/surveycalc/surveycalc/algorithm/bl2xy/bl2xy.htm
//ギリシャ文字等は、φ = ff, λ = l, α = a, t_ = tb, ξ' = k, η' = nn, σ = ss, τ = tt, S_φ0 = Sb, A_ = Ab, とする.
//φ,λ   : 新点の緯度及び経度.
//φ0,λ0 : 平面直角座標原点の緯度及び経度.
//α,F   : 楕円体の長半径及び逆扁平率.
//m0    : 平面直角座標系のX軸上における縮尺係数 (0.9999).

//ラジアン変換.
const ff = lat * Math.PI / 180;
const l = lng * Math.PI / 180;

//ラジアン変換.
const ff0 = lat0 * Math.PI / 180;
const l0 = lng0 * Math.PI / 180;

let aj;
let Aj;
let j = 1;

const a = 6378137;       //測地基準系1980(GRS80)楕円体(世界測地系).
const F = 298.257222101; //測地基準系1980(GRS80)楕円体(世界測地系).
const m0 = 0.9999;
const n = 1 / (2 * F - 1);

const t = Math.sinh( Math.atanh(Math.sin(ff)) - ((2 * Math.sqrt(n)) / (1 + n)) * Math.atanh(((2 * Math.sqrt(n)) / (1 + n)) * Math.sin(ff)) );
const tb = Math.sqrt(1 + t * t);
const lc = Math.cos(l - l0);
const ls = Math.sin(l - l0);
const k = Math.atan(t / lc);
const nn = Math.atanh(ls / tb);

const A0 = 1 + ((n**2) / 4) + ((n**4) / 64);
const A1 = -(3 / 2) * (n - ((n**3) / 8) - ((n**5) / 64));
const A2 = (15 / 16) *((n**2) - ((n**4) / 4));
const A3 = -(35 / 48) * ((n**3) - ((5 / 16) * (n**5)));
const A4 = (315 / 512) * (n**4);
const A5 = -(693 / 1280) * (n**5);

let Sbs = 0;
for (j = 1; j <= 5; j++) {
    if (j == 1) {
        Aj = A1;
    } else if (j == 2) {
        Aj = A2;
    } else if (j == 3) {
        Aj = A3;
    } else if (j == 4) {
        Aj = A4;
    } else if (j == 5) {
        Aj = A5;
    }

    Sbs += Aj * Math.sin(2 * j *ff0);
};

const Sb = ((m0 * a) / (1 + n)) * ((A0 * ff0) + Sbs);
const Ab = ((m0 * a) / (1 + n)) * A0;

const a1 = ((1 / 2) * n) - ((2 / 3) * (n**2)) + ((5 / 16) * (n**3)) + ((41 / 180) * (n**4)) - ((127 / 288) * (n**5));
const a2 = ((13 / 48) * (n**2)) - ((3 / 5) * (n**3)) + ((577 / 1440) * (n**4)) + ((281 / 630) * (n**5));
const a3 = ((61 / 240) * (n**3)) - ((103 / 140) * (n**4)) + ((15061 / 26880) * (n**5));
const a4 = ((49561 / 161280) * (n**4)) - ((179 / 168) * (n**5));
const a5 = ((34729 / 80640) * (n**5));

//x座標.
let xs = 0;
for (j = 1; j <= 5; j++) {
    if (j == 1) {
        aj = a1;
    } else if (j == 2) {
        aj = a2;
    } else if (j == 3) {
        aj = a3;
    } else if (j == 4) {
        aj = a4;
    } else if (j == 5) {
        aj = a5;
    }

    xs += aj * Math.sin(2 * j * k) * Math.cosh(2 * j * nn)
};

const x = Ab * (k + xs) - Sb;

//y座標.
let ys = 0;
for (j = 1; j <= 5; j++) {
    if (j == 1) {
        aj = a1;
    } else if (j == 2) {
        aj = a2;
    } else if (j == 3) {
        aj = a3;
    } else if (j == 4) {
        aj = a4;
    } else if (j == 5) {
        aj = a5;
    }

    ys += aj * Math.cos(2 * j *k) * Math.sinh(2 * j * nn);

};

const y = Ab * (nn + ys);

return { x, y };

};

const chaOne = changeOne(lato, lngo, lat0, lng0);
const chaTwo = changeOne(pinLatitude, pinLongitude, lat0, lng0);

//x座標をyf, y座標をxfにしていますが、xが縦でyが横(測量上のルール)なのは分かり難く、ミスを防ぐ為です.ご了承を.
const xf = chaOne.y; //現在地 y座標[m].
const yf = chaOne.x; //現在地 x座標[m].
const xfp = chaTwo.y; //ピン y座標[m].
const yfp = chaTwo.x; //ピン x座標[m].

console.log("平面直角座標(x): " + yf + "[m](現)");
console.log("平面直角座標(y): " + xf + "[m](現)");
console.log("平面直角座標(x): " + yfp + "[m](ピン)");
console.log("平面直角座標(y): " + xfp + "[m](ピン)");

tx = xfp - xf;
ty = yfp - yf;

console.log("tx: " + tx);
console.log("ty: " + ty);

//高さと底辺から角度を算出.
angle = Math.atan((Math.abs(ty) / Math.abs(tx))) * (180/Math.PI);
console.log(angle);

//高さと底辺から斜辺を算出.
const tt = Math.sqrt((tx ** 2) + (ty ** 2));
console.log("斜辺: " + tt + "[m]");

const tts = Math.floor(tt * (10 ** 1)) / (10 ** 1);
const accs = Math.floor(acc * (10 ** 1)) / (10 ** 1);

const ttw = document.getElementById("tt");
ttw.innerHTML = `<p id='tt' style='position: fixed; transform: rotate(90deg); top: 7lvh; right: 0px; font-size: 4.3lvw; padding: 5px 5px 5px 30px; color: #fff; background-color: rgba(0, 0, 0, 0.5);'>あと ${tts}[m]<span style='font-size: 2lvw;'>(精度: ${accs}[m])</span></p>`;

};

const fun = async() => {
let geogeo = await geoOne();
photo(geogeo.lato, geogeo.lngo, geogeo.acc);
}
fun();

const watchID = navigator.geolocation.watchPosition((position) => {
    photo(position.coords.latitude, position.coords.longitude, position.coords.accuracy);
    console.log("更新。");
  });