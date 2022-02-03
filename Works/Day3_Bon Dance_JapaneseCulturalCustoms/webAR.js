//MediaPipeやOpenCVでの処理を記述
let canvasElement;
let canvasCtx;  //キャンバスコンテキストを使って絵を描く
let flag_forLeaveSpace = 0;


//初期化
window.onload = function () {
    //画像の読み込み
    beam = document.getElementById('beam');
    beam_blue = document.getElementById('beam_blue');
    kameha = document.getElementById('kameha');
    //ビデオ要素の取得
    let videoElement = document.getElementById('input_video');
    //表示用のCanvasを取得
    canvasElement = document.getElementById('output_canvas');
    //Canvas描画に関する情報にアクセス
    canvasCtx = canvasElement.getContext('2d');
    //HandTrackingを使用するための関連ファイルの取得と初期化
    hands = new Hands({
        locateFile: (file) => {
            return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
        }
    });
    //手の認識に関するオプション 
    hands.setOptions({
        selfieMode: true,  //画像を左右反転
        maxNumHands: 2, //認識可能な手の最大数
        modelComplexity: 1,//精度に関する設定(0~1)
        minDetectionConfidence: 0.4,//手検出の信頼度 0〜1の値が帰ってきた時に幾つ以上の場合に手を判定するか
        minTrackingConfidence: 0.3,//手追跡の信頼度
        useCpuInference: false, //M1 MacのSafariの場合は1  crhomかfirefoxでやる
    });
    //結果を処理する関数を登録
    // console.log(hands);
    hands.onResults(recvResults);

    //カメラの初期化
    const camera = new Camera(videoElement, {
        onFrame: async () => {
            //カメラの画像を用いて手の検出を実行
            await hands.send({ image: videoElement });  //videoElementの映像をハンドトラッキング処理に渡す
        },
        width: 1280, height: 720  //画像サイズを設定
    });
    //カメラの動作開始
    camera.start();
};

//results = MediaPipeによる手の検出結果 を利用する
function recvResults(results) {
    let width = results.image.width;  //イメージの元画像お大きさ
    let height = results.image.height;
    //画像のサイズとcanbasのサイズが異なる場合はサイズを調整
    if (width != canvasElement.width) { //最初は一致しないので
        //入力画像と同じサイズのcanvas(描画領域)を用意
        canvasElement.width = width;
        canvasElement.height = height;
    }
    //以下canvasへの描画に関する記述 saveで始まりrestoreでおわる
    canvasCtx.save();
    //(カメラで取得した)画像を表示  →消すと白いキャンバスにひたすら手の動きが描画されていく 
    // canvasCtx.drawImage(results.image, 0, 0, width, height);
    //手を検出したならばtrue
    if (results.multiHandLandmarks) {
        //見つけた手の数だけ処理を繰り返す
        for (const landmarks of results.multiHandLandmarks) {
            //骨格を描画(MediaPipeのライブラリ)  コメントアウトすれば表示せずに済む
            // drawConnectors(canvasCtx, landmarks, HAND_CONNECTIONS, { color: '#EEEEEE', lineWidth: 1 });  //大きくすると線が太くなる
            //関節を描画(MediaPipeのライブラリ)  コメントアウトすれば表示せずに済む
            // drawLandmarks(canvasCtx, landmarks, { color: '#EEEEEEE', lineWidth: 10, radius: 5 });
            if (flag_forLeaveSpace == 0) {
                drawLandmarks(canvasCtx, landmarks, { color: '#FFFFFF', lineWidth: 0.5, radius: 1 });
                flag_forLeaveSpace = 1;
            } else if (flag_forLeaveSpace == 1) {
                drawLandmarks(canvasCtx, landmarks, { color: '#CCCCCC', lineWidth: 0.5, radius: 1 });
                flag_forLeaveSpace = 2;
            } else if (flag_forLeaveSpace == 2) {
                drawLandmarks(canvasCtx, landmarks, { color: '#140000', lineWidth: 0.5, radius: 1 });
                flag_forLeaveSpace = 3;
            } else if (flag_forLeaveSpace == 3) {
                drawLandmarks(canvasCtx, landmarks, { color: '#101010', lineWidth: 0.5, radius: 1 });
                flag_forLeaveSpace = 0;
            }

        }
    }
    canvasCtx.restore();
}

//手の中心や傾きを計算  関節の点群データlandmarksは画像の各幅全体を1と置き換えたパラメーターになっている。配列で０番目から20番目までの値が入っている
// function cvFunction(landmarks, width, height) {
//     //手の関節を保持する配列
//     let points = [];
//     //手のひらや親指の付け根付近以外の関節を取得
//     for (var i = 2; i < 21; i++) {  //手首の０、１は無視する
//         //0~1で表現されたx,yを画像のサイズに変換
//         points.push(landmarks[i].x * width);
//         points.push(landmarks[i].y * height);
//     }
//     //点の集まりをOpenCVで扱えるデータフォーマットmatに変換         
//     let mat = cv.matFromArray(points.length / 2, 1, cv.CV_32SC2, points);
//     //点の集まりにフィットする楕円を計算 
//     ell = cv.fitEllipse(mat);
//     //メモリの解放(変数定義するとメモリを消費しているので不要になったら消す)
//     mat.delete();

//     //親指と人差し指までの距離
//     let dx = (landmarks[7].x - landmarks[4].x) * width;
//     let dy = (landmarks[7].y - landmarks[4].y) * height;
//     let distance1 = Math.sqrt(dx * dx + dy * dy);

// }

// //ライトセイバーを表示
// function drawLightSaber() {  //画像、位置X、位置Y、横幅、縦幅
//     //楕円の角度
//     let angle = ell.angle;
//     //ライトセイバーの向きを反転 openCVは第２.３象限でしか角度判定できない 
//     if (angle < 90) { angle = angle - 180; }
//     //デフォルトサイズを元画像の２倍くらいにしたい  ratioをかけることで親指の立ち具合で大きさが変わるようになった
//     let mul = ratio * (ell.size.width * 1.5) / beam.width;
//     //位置指定
//     canvasCtx.translate(ell.center.x, ell.center.y);
//     //角度指定
//     canvasCtx.rotate(angle * Math.PI / 180.0); //openCVの角度は°でcanvasはラジアン
//     //楕円を描画
//     canvasCtx.beginPath();    //複数の点をつなぐ線を書くよの宣言
//     canvasCtx.ellipse(0, 0,   //位置 楕円そのものでは位置指定せず、全体のオブジェクトに対してtranslate()で指定する
//         ell.size.width / 2.0, ell.size.height / 2.0,  //半径
//         0, 0, 2 * Math.PI);    //角度と表示の開始・終了
//     // canvasCtx.stroke();  //線で書くよ
//     //デフォルトサイズに倍数をかける
//     canvasCtx.scale(mul, mul);
//     if (nowPlaying_DV) {
//         canvasCtx.drawImage(beam, -beam.width / 2.0, 0, beam.width, beam.height); //画像の位置をあらかじめx方向に半分ずらす
//     } else if (nowPlaying_SW) {
//         canvasCtx.drawImage(beam_blue, -beam_blue.width / 2.0, 0, beam_blue.width, beam_blue.height);
//     }
// }


//ライトセイバー起動時の一回のみ効果音
// function wakeSaber_SE() {
//     if (SE_flag == 0) {
//         // console.log("wakeSaber");
//         SE_wake.play();
//         SE_flag++;
//         console.log(SE_flag);
//     }
// }
// //ライトセイバー振った時の効果音
// function swingSaber_SE() {
//     if (rightOrLeft == 1) {
//         console.log("swingRight");
//         SE_right.play();
//     } else if (rightOrLeft == 2) {
//         console.log("swingLeft");
//         SE_left.play();
//     }
// }
//親指が立っている間に親指のxy座標を拾って、差分を取って速度を計算する
// function thumb_deltaPos(landmark_4) {
//     thumbPos_x = landmark_4.x;
//     thumbPos_y = landmark_4.y;
//     posThumbs = [thumbPos_x, thumbPos_y]
//     // console.log(posThumbs);
//     deltaPos_x = thumbPos_x - thumbPosPast_x;
//     deltaPos_y = thumbPos_y - thumbPosPast_y;
//     deltaPos = Math.sqrt(deltaPos_x * deltaPos_x + deltaPos_y * deltaPos_y) * 100;
//     // console.log(deltaPos);
//     let a = deltaPos_x * 100;
//     console.log(a);
//     if (a >= 0) {
//         rightOrLeft = 1;
//     } else if (a < 0) {
//         rightOrLeft = 2;
//     }
//     // console.log(rightOrLeft);
//     //移動距離が一定量より大きかったら効果音を出す
//     if (deltaPos >= 5) {
//         swingSaber_SE();
//     }
//     //リセット
//     thumbPosPast_x = thumbPos_x;
//     thumbPosPast_y = thumbPos_y;
//     flag_forLeaveSpace = 0;
// }