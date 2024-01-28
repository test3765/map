let pinLatitude = 35.67866;
let pinLongitude = 139.80809;

///////////////////////////////////////////////////////////////////////////////////////////////////////////////

//初期値.
let tx = 0;
let ty = 0;
let angle = 0;
let z = 0;

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

//系番号から原点座標を判定.
let lat0 = 36.000000;     //平面直角座標系原点(緯度).
let lng0 = 139 + (50/60); //平面直角座標系原点(経度).
console.log("平面直角座標第IX系原点(緯度,10進法): " + lat0);
console.log("平面直角座標第IX系原点(経度,10進法): " + lng0);

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

const alp = () => {
    console.log("tx: " + tx);
    console.log("ty: " + ty);
    console.log("ang: " + angle);

    //現在地を原点としたときのピンの方角を方位角化.
    let dir = '';
    if ((tx >= 0) && (ty >= 0)) {
        //txとtyが共にプラスの場合は、北東(+0°).
        dir = 0;
    } else if ((tx >= 0) &&  (ty < 0)) {
        //txがプラス、tyがマイナスの場合は、南東(+90°).
        dir = 90;
    } else if ((tx < 0) && (ty >= 0)) {
        //txがマイナス、tyがプラスの場合は、南西(+180°).
        dir = 180;
    } else if ((tx < 0) && (ty < 0)) {
        //txとtyが共にマイナスの場合は、北西(+270°).
        dir = 270;
    };

    //ピンの方位角.
    const angleN = angle + dir;
    console.log(angleN);

    //ユーザーの向いている方角との残差.
    z = angleN - degrees;
    console.log("z: " + z);

    Marker();
};


const Marker = () => {
    //残差の正負でピンマーカーを出すか決める(一周回った場合は、alphaが0に戻る為、左右が変わる).
    if (z > 15) {
        //残差が10°より多ければ(プラスの場合).
        //ピンマーカーを右に出す.
        const right = document.getElementById("right");
        right.style.width = "25lvw";
        const left = document.getElementById("left");
        left.style.width = "0px";
        console.log("right");
    } else if ((z <= 15) && (z >= -15)) {
        //残差が10°~-10°の場合.
        //ピンマーカーは出さない(何もしない).
        const right = document.getElementById("right");
        right.style.width = "0px";
        const left = document.getElementById("left");
        left.style.width = "0px";
    } else if (z < -15) {
        //残差が-10°より少なければ(マイナスの場合).
        //ピンマーカーを左に出す.
        const right = document.getElementById("right");
        right.style.width = "0px";
        const left = document.getElementById("left");
        left.style.width = "25lvw";
        console.log("left");
    };
};


//簡易OS判定.
let os;
let browser;

const judgementOS = () => {
    let os = '';
    const osBrowserOne = window.navigator.userAgentData;
    if (osBrowserOne) {
        //userAgentDataに対応しているOSの場合.
        const osJ = navigator.userAgentData.platform;
        if (osJ.indexOf('iPhone') != -1) {
            os = 'iPhone';
        } else if (osJ.indexOf('Android') != -1) {
            os = 'normal';
        } else if (osJ.indexOf('Windows') != -1) {
            os = 'notMobile';
        } else if (osJ.indexOf('macOS') != -1) {
            os = 'notMobile';
        } else {
            os = '？';
        }               
    } else {
        //userAgentDataに対応してないOSの場合.
        const osBrowserTwo = window.navigator.userAgent.toLowerCase();
        if (osBrowserTwo.indexOf('iphone') != -1) {
            os = 'iPhone';
        } else if (osBrowserTwo.indexOf('android') != -1 && osBrowserTwo.indexOf('mobile') != -1) {
            os = 'normal';
        } else if ((osBrowserTwo.indexOf('ipad') != -1) || ((osBrowserTwo.indexOf('macintosh') != -1) && ('ontouchend' in document))) {
            os = 'iPad';
        } else if (osBrowserTwo.indexOf('ipod') != -1) {
            os = 'notMobile';
        } else if (osBrowserTwo.indexOf('android') != -1) {
            os = 'notMobile';
        } else if (osBrowserTwo.indexOf('windows nt') != -1) {
            os = 'notMobile';
        } else if (osBrowserTwo.indexOf('mac os x') != -1) {
            os = 'notMobile';
        } else {
            os = '？';
        }
    }

    return os;
};

//ブラウザ判定.
const judgementBrowser = () => {
    let browser = '';
    const osBrowserOne = window.navigator.userAgentData;
    if (osBrowserOne) {
        //userAgentDataに対応しているブラウザの場合.
        const brands = navigator.userAgentData.brands;
        for (let i = 0; i < brands.length; i++) {
            const brand = brands[i].brand;
            if (brand.indexOf('Google Chrome') != -1) {
                browser = "normal";
            } else if (brand.indexOf('Microsoft Edge') != -1) {
                browser = "normal";
            } else if (brand.indexOf('Opera') != -1) {
                browser = "normal";
            }
        }
    
    } else {
        const osBrowserTwo = window.navigator.userAgent.toLowerCase();
        //ブラウザ判定.
        if (osBrowserTwo.indexOf('edg') != -1 || osBrowserTwo.indexOf('edge') != -1) { //順番が重要です(Edge→Opera→Chrome→Safari→その他).
            browser = "normal";
        } else if (osBrowserTwo.indexOf('opr') != -1 || osBrowserTwo.indexOf('opera') != -1) {
            browser = "normal";
        } else if (osBrowserTwo.indexOf('chrome') != -1) {
            browser = "normal";
        } else if (osBrowserTwo.indexOf('safari') != -1) {
            browser = "Safari";
        } else if (osBrowserTwo.indexOf('firefox') != -1) {
            browser = "normal";
        } else {
            browser = '？';
        }
    }

    return browser;
};

//方角判定.
let degrees = NaN;
// 初期化
function init() {
    // 簡易的なOS判定
    os = judgementOS();
    browser = judgementBrowser();
    if ((os == "iPhone") && (browser == "Safari")) {
        // safari用。DeviceOrientation APIの使用をユーザに許可して貰う
        const permitBtn = document.getElementById("permitBtn");
        permitBtn.innerHTML = "<button id='permitBtn'>コンパスの利用を許可する</button>";
        permitBtn.addEventListener("click", permitDeviceOrientationForSafari);

        window.addEventListener(
            "deviceorientation",
            orientation,
            true
        );
    } else if ((os == "normal") || ((os == "iPhone") && (browser != "Safari"))) {
        window.addEventListener(
            "deviceorientationabsolute",
            orientation,
            true
        );
    } else{
        window.alert("申し訳ございません。\nこの機能は、お使いの環境ではご利用になれません。\nデバイスは「Androidスマホ」「iPhone」,\nブラウザは「Google Chrome」「Microsoft Edge」「Mozilla Firefox」「Opera」「Safari」のご使用をお願いいたします。");
    }
}

// ジャイロスコープと地磁気をセンサーから取得
function orientation(event) {
    let absolute = event.absolute;
    let alpha = event.alpha;
    let beta = event.beta;
    let gamma = event.gamma;

    if ((alpha == undefined) || (beta == undefined) || (gamma == undefined)) {
        window.alert("申し訳ございません。\nお使いのデバイスは、コンパスの取得に対応していないようです。")
    }

    if(os == "iPhone") {
        // webkitCompasssHeading値を採用
        degrees = event.webkitCompassHeading;

        alp();
    } else if (os == "normal") {
        // deviceorientationabsoluteイベントのalphaを補正
        degrees = compassHeading(alpha, beta, gamma);

        alp();
    }
    }

// 端末の傾き補正（Android用）
// https://www.w3.org/TR/orientation-event/
function compassHeading(alpha, beta, gamma) {
    var degtorad = Math.PI / 180; // Degree-to-Radian conversion

    var _x = beta ? beta * degtorad : 0; // beta value
    var _y = gamma ? gamma * degtorad : 0; // gamma value
    var _z = alpha ? alpha * degtorad : 0; // alpha value

    var cX = Math.cos(_x);
    var cY = Math.cos(_y);
    var cZ = Math.cos(_z);
    var sX = Math.sin(_x);
    var sY = Math.sin(_y);
    var sZ = Math.sin(_z);

    // Calculate Vx and Vy components
    var Vx = -cZ * sY - sZ * sX * cY;
    var Vy = -sZ * sY + cZ * sX * cY;

    // Calculate compass heading
    var compassHeading = Math.atan(Vx / Vy);

    // Convert compass heading to use whole unit circle
    if (Vy < 0) {
        compassHeading += Math.PI;
    } else if (Vx < 0) {
        compassHeading += 2 * Math.PI;
    }

    return compassHeading * (180 / Math.PI); // Compass Heading (in degrees)
}

// iPhone + Safariの場合はDeviceOrientation APIの使用許可をユーザに求める
function permitDeviceOrientationForSafari() {
    DeviceOrientationEvent.requestPermission()
        .then(response => {
            if (response === "granted") {
                window.addEventListener(
                    "deviceorientation",
                    detectDirection
                );
            }
        })
        .catch((error) => {
            window.alert("申し訳ございません。\nSafariをご利用の場合、コンパスの許可をいただく必要がございます。\nお手数おかけしますが、このWebサイトの権限を設定してからお試しください。");
        });
}

// DOM構築完了イベントハンドラ登録
window.addEventListener("DOMContentLoaded", init());