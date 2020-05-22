// https://github.com/tsuyopon-xyz/drawing_app_part2/blob/master/main.js
// 上記のコードを元に以下の追加機能を追加します。
// - 線の太さ変更する機能
//
// ページの読み込みが完了したらコールバック関数が呼ばれる
// ※コールバック: 第2引数の無名関数(=関数名が省略された関数)
window.addEventListener('load', () => {
  const canvas = document.querySelector('#draw-area');
  // contextを使ってcanvasに絵を書いていく
  const context = canvas.getContext('2d');

  // 現在のマウスの位置を中心に、現在選択している線の太さを「○」で表現するために使用するcanvas
  const canvasForWidthIndicator = document.querySelector('#line-width-indicator');
  const contextForWidthIndicator = canvasForWidthIndicator.getContext('2d');

  // 直前のマウスのcanvas上のx座標とy座標を記録する
  const lastPosition = { x: null, y: null };
  // マウスがドラッグされているか(クリックされたままか)判断するためのフラグ
  let isDrag = false;
  let currentColor = '#000000';

  // 現在の線の太さを記憶する変数
  // <input id="range-selector" type="range"> の値と連動する
  let currentLineWidth = 1;

  // 絵を書く
  function draw(x, y) {
    // マウスがドラッグされていなかったら処理を中断する。
    // ドラッグしながらしか絵を書くことが出来ない。
    if(!isDrag) {
      return;
    }

    // 「context.beginPath()」と「context.closePath()」を都度draw関数内で実行するよりも、
    // 線の描き始め(dragStart関数)と線の描き終わり(dragEnd)で1回ずつ読んだほうがより綺麗に線画書ける

    // 線の状態を定義する
    // MDN CanvasRenderingContext2D: https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/lineJoin

    context.lineCap = 'round'; // 丸みを帯びた線にする
    context.lineJoin = 'round'; // 丸みを帯びた線にする
    context.lineWidth = currentLineWidth; // 線の太さ
    context.strokeStyle = currentColor; // 線の色

    // 書き始めは lastPosition.x, lastPosition.y の値はnullとなっているため、
    // クリックしたところを開始点としている。
    // この関数(draw関数内)の最後の2行で lastPosition.xとlastPosition.yに
    // 現在のx, y座標を記録することで、次にマウスを動かした時に、
    // 前回の位置から現在のマウスの位置まで線を引くようになる。
    if (lastPosition.x === null || lastPosition.y === null) {
      // ドラッグ開始時の線の開始位置
      context.moveTo(x, y);
    } else {
      // ドラッグ中の線の開始位置
      context.moveTo(lastPosition.x, lastPosition.y);
    }
    // context.moveToで設定した位置から、context.lineToで設定した位置までの線を引く。
    // - 開始時はmoveToとlineToの値が同じであるためただの点となる。
    // - ドラッグ中はlastPosition変数で前回のマウス位置を記録しているため、
    //   前回の位置から現在の位置までの線(点のつながり)となる
    context.lineTo(x, y);
    // context.moveTo, context.lineToの値を元に実際に線を引く
    context.stroke();
    // 現在のマウス位置を記録して、次回線を書くときの開始点に使う
    lastPosition.x = x;
    lastPosition.y = y;
  }

  // <canvas　id="line-width-indicator"> 上で現在のマウスの位置を中心に
  // 線の太さを表現するための「○」を描画する。
  function showLineWidthIndicator(x, y) {
    contextForWidthIndicator.lineCap = 'round';
    contextForWidthIndicator.lineJoin = 'round';
    contextForWidthIndicator.strokeStyle = currentColor;

    // 「○」の線の太さは細くて良いので1で固定
    contextForWidthIndicator.lineWidth = 1;

    // 過去に描画「○」を削除する。過去の「○」を削除しなかった場合は
    // 過去の「○」が残り続けてします。(以下の画像URLを参照)
    // https://tsuyopon.xyz/wp-content/uploads/2018/09/line-width-indicator-with-bug.gif
    contextForWidthIndicator.clearRect(0, 0, canvasForWidthIndicator.width, canvasForWidthIndicator.height);

    contextForWidthIndicator.beginPath();

    // x, y座標を中心とした円(「○」)を描画する。
    // 第3引数の「currentLineWidth / 2」で、実際に描画する線の太さと同じ大きさになる。
    // ドキュメント: https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/arc
    contextForWidthIndicator.arc(x, y, currentLineWidth / 2, 0, 2 * Math.PI);

    contextForWidthIndicator.stroke();
  }

  // canvas上に書いた絵を全部消す
  function clear() {
    context.clearRect(0, 0, canvas.width, canvas.height);
  }

  // マウスのドラッグを開始したらisDragのフラグをtrueにしてdraw関数内で
  // お絵かき処理が途中で止まらないようにする
  function dragStart(event) {
    // これから新しい線を書き始めることを宣言する
    // 一連の線を書く処理が終了したらdragEnd関数内のclosePathで終了を宣言する
    context.beginPath();

    isDrag = true;
  }
  // マウスのドラッグが終了したら、もしくはマウスがcanvas外に移動したら
  // isDragのフラグをfalseにしてdraw関数内でお絵かき処理が中断されるようにする
  function dragEnd(event) {
    // 線を書く処理の終了を宣言する
    context.closePath();
    isDrag = false;
    // 描画中に記録していた値をリセットする
    lastPosition.x = null;
    lastPosition.y = null;
  }

  // マウス操作やボタンクリック時のイベント処理を定義する
  function initEventHandler() {
    const clearButton = document.querySelector('#clear-button');
    const eraserButton = document.querySelector('#eraser-button');
    clearButton.addEventListener('click', clear);
    eraserButton.addEventListener('click', () => {
      currentColor = '#FFFFFF';
    });

    // layeredCanvasAreaは2つのcanvas要素を保持している。2つのcanvasはそれぞれ以下の役割を持つ
    //
    // 1. 絵を書くためのcanvas
    // 2. 現在のマウスの位置を中心として、太さを「○」の形で表現するためのcanvas
    //
    // 1と2の機能を1つのキャンパスで共存することは出来ない。
    // 共存できない理由は以下の通り。
    //
    // - 1の機能は過去に描画してきた線の保持し続ける
    // - 2の機能は前回描画したものを削除する必要がある。削除しなかった場合は、過去の「○」が残り続けてしまう。(以下の画像URLを参照)
    //   - https://tsuyopon.xyz/wp-content/uploads/2018/09/line-width-indicator-with-bug.gif
    //
    // 上記2つの理由より
    // - 1のときはcontext.clearRectを使うことが出来ず
    // - 2のときはcontextForWidthIndicator.clearRectを使う必要がある
    const layeredCanvasArea = document.querySelector('#layerd-canvas-area');

    // 元々はcanvas.addEventListenerとしていたが、
    // 2つのcanvasを重ねて使うようになったため、親要素である <span id="layerd-canvas-area">に対して
    // イベント処理を定義するようにした。
    layeredCanvasArea.addEventListener('mousedown', dragStart);
    layeredCanvasArea.addEventListener('mouseup', dragEnd);
    layeredCanvasArea.addEventListener('mouseout', dragEnd);
    layeredCanvasArea.addEventListener('mousemove', event => {
      // 2つのcanvasに対する描画処理を行う

      // 実際に線を引くcanvasに描画を行う。(ドラッグ中のみ線の描画を行う)
      draw(event.layerX, event.layerY);

      // 現在のマウスの位置を中心として、線の太さを「○」で表現するためのcanvasに描画を行う
      showLineWidthIndicator(event.layerX, event.layerY);
    });
  }
  
  // カラーパレットの設置を行う
  function initColorPalette() {
    const joe = colorjoe.rgb('color-palette', currentColor);
    // 'done'イベントは、カラーパレットから色を選択した時に呼ばれるイベント
    // ドキュメント: https://github.com/bebraw/colorjoe#event-handling
    joe.on('done', color => {
      // コールバック関数の引数からcolorオブジェクトを受け取り、
      // このcolorオブジェクト経由で選択した色情報を取得する
 
      // color.hex()を実行すると '#FF0000' のような形式で色情報を16進数の形式で受け取れる
      // draw関数の手前で定義されている、線の色を保持する変数に代入して色情報を変更する

      currentColor = color.hex();
    });
  }

  // 文字の太さの設定・更新を行う機能
  function initConfigOfLineWidth() {
    const textForCurrentSize = document.querySelector('#line-width');
    const rangeSelector = document.querySelector('#range-selector');

    // 線の太さを記憶している変数の値を更新する
    currentLineWidth = rangeSelector.value;

    // "input"イベントをセットすることでスライド中の値も取得できるようになる。
    // ドキュメント: https://developer.mozilla.org/ja/docs/Web/HTML/Element/Input/range
    rangeSelector.addEventListener('input', event => {
      const width = event.target.value;

      // 線の太さを記憶している変数の値を更新する
      currentLineWidth = width;

      // 更新した線の太さ値(数値)を<input id="range-selector" type="range">の右側に表示する
      textForCurrentSize.innerText = width;
    });
  }

  initEventHandler();
  // カラーパレット情報を初期化する
  initColorPalette();

  // 文字の太さの設定を行う機能を有効にする
  initConfigOfLineWidth();
});