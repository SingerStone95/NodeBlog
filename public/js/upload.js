const form = document.querySelector("form");
const dropArea = document.querySelector(".drag-area");
fileInput = document.querySelector(".file-input");
progressArea = document.querySelector(".progress-area");
uploadedArea = document.querySelector(".uploaded-area");
converBtn = document.getElementById("convert_btn");
const allowed_EXT = /(\.jpg|\.jpeg|\.bmp|\.gif|\.png|\.zip|\.rar|\.tar|\.txt|\.mp4|\.mp3|\.7z|\.doc|\.docx|\.xls|\.pdf)$/i;
const files_name_upload = [];
var convert_state = 'unknown';
dragForm = document.getElementById('drag-form');
dragText = document.getElementById('drag_text');
dragCloud = document.getElementById('drag-cloud');
dragInput = document.getElementById('file-input');
dragZone = document.getElementById('drag-area');
dragWarper = document.getElementById('drag-warper');
function showToast(s, c) {
  var x = document.getElementById("snackbar");
  var text = document.createTextNode(s);
  x.style.backgroundColor = c;
  x.textContent = '';
  x.appendChild(text);
  x.className = "show";
  setTimeout(function () { x.className = x.className.replace("show", ""); }, 3000);
}
function getDomain() {
  const host = window.location.host;
  const port = window.location.port;
  if (port !== "" && (port !== "80" && port !== "443")) {
    return host.substring(0, host.lastIndexOf(":"));
  } else {
    return host;
  }
}

function downloadFile(fileUrl) {
  var a = document.createElement('a');
  a.style.display = 'none';
  a.href = fileUrl;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

// convert
converBtn.addEventListener("click", () => {
  if (files_name_upload.length == 0) {
    showToast('转换列表为空', 'red');
    return;
  }
  if (convert_state != 'unknown' && convert_state != 'end') {
    showToast('正在转换中... 请稍后再试', 'red');
    return;
  }
  console.log(files_name_upload);
  if ("WebSocket" in window) {
    // 打开一个 web socket
    var ws_host = 'ws://' + getDomain() + ':8889/convert';
    console.log(ws_host);
    var ws = new WebSocket(ws_host);
    ws.onopen = function () {
      var msg = { data: files_name_upload };
      ws.send(JSON.stringify(msg));
      console.log(msg);
    };
    ws.onmessage = function (evt) {
      console.log(evt.data);
      var response = JSON.parse(evt.data);
      convert_state = response.state;
      if (response.state == 'start') {
        converBtn.className = 'convert-file-disabled';
        converBtn.textContent = "转换中，请稍候..";
      } else if (response.state == 'process') {
        // 更新css状态
        var spans = document.querySelectorAll(".uploaded-area .row .details .name");
        for (let span of spans) {
          let span_text = span.innerText;
          let details = span.parentNode.parentNode.parentNode;
          if (span_text.split('•')[0].trim() == response.filename) {
            if (response.process == 0) {
              span.innerText = `${response.filename} • 正在转换`;
              details.classList.add('fade-animation');
            } else if (response.process == 1) {
              span.innerText = `${response.filename} • 转换完成`;
              details.classList.remove('fade-animation');
            }
          }
        }
      } else if (response.state == 'end') {
        converBtn.className = 'convert-file';
        converBtn.textContent = "(●'◡'●)开始转换";
        let download_url = window.location.origin + '/cdn/' + response.download_url;
        downloadFile(download_url);
      } else {
        // 暂未处理
      }

    };

    ws.onclose = function () {
      // 关闭 websocket

    };
  } else {
    showToast('您的浏览器不支持 WebSocket!', 'red');
  }


});

fileInput.onchange = ({ target }) => {
  // Check for how much files
  let file = target.files;
  if (file.length === 1) {
    // let fileName = file[0].name;
    if (!allowed_EXT.exec(file[0].name)) {
      showToast('For security resion this extenstion is forbided use zip insted', 'red');
    }
    else {
      if (!files_name_upload.includes(file[0].name)) {
        files_name_upload.push(file[0].name);
        uploadFile(file[0].name);
      }
    }
  } else {
    showToast('For security resion multiple file uploading is forbided use zip insted', 'blue');
  }
}

dropArea.addEventListener("dragover", (event) => {
  event.preventDefault();
  dragText.textContent = "Release to Upload File";
  dragCloud.style.color = "#a366ff";
  dragForm.style.borderColor = "#a366ff";
  // dragWarper.style.width = "550px";
  dragText.style.fontSize = "24px";
  dragText.style.color = "#a366ff";
});


dropArea.addEventListener("dragleave", () => {
  dragText.textContent = "Click Or Drag and Drop File to Upload";
  dragCloud.style.color = "#6990F2";
  dragForm.style.borderColor = "#6990F2";
  // dragWarper.style.width = "485px";
  dragText.style.fontSize = "18px";
  dragText.style.color = "#6990F2";

});


//If user drop File on DropArea
dropArea.addEventListener("drop", (event) => {
  event.preventDefault();
  var all_drop_files = event.dataTransfer.files;

  if (all_drop_files.length === 1) {
    if (!allowed_EXT.exec(all_drop_files[0].name)) {
      showToast('For security resion this extenstion is forbided use zip insted', 'red');
    }
    else {
      if (!files_name_upload.includes(all_drop_files[0].name)) {
        files_name_upload.push(all_drop_files[0].name);
        drop_Upload(all_drop_files[0]);
      }
    }
  } else {
    showToast('For security resion multiple file uploading is forbided use zip insted', 'blue');
  }
  dragText.textContent = "Click Or Drag and Drop File to Upload";
  dragCloud.style.color = "#6990F2";
  dragForm.style.borderColor = "#6990F2";
  // dragWarper.style.width = "485px";
  dragText.style.fontSize = "18px";
  dragText.style.color = "#6990F2";
});


function drop_Upload(drop_files) {
  var form_data = new FormData();
  form_data.append("sampleFile", drop_files);
  var ajax_request = new XMLHttpRequest();
  ajax_request.open("post", "/upload");
  var dro_file = drop_files.name;
  ajax_request.upload.addEventListener("progress", ({ loaded, total }) => {
    let fileLoaded = Math.floor((loaded / total) * 100);
    let fileTotal = Math.floor(total / 1000);
    let fileSize;
    (fileTotal < 1024) ? fileSize = fileTotal + " KB" : fileSize = (loaded / (1024 * 1024)).toFixed(2) + " MB";
    let progressHTML = `<li class="row">
                          <i class="fas fa-file-alt"></i>
                          <div class="content">
                            <div class="details">
                              <span class="name">${dro_file} • 上传中</span>
                              <span class="percent">${fileLoaded}%</span>
                            </div>
                            <div class="progress-bar">
                              <div class="progress" style="width: ${fileLoaded}%"></div>
                            </div>
                          </div>
                        </li>`;
    uploadedArea.classList.add("onprogress");
    progressArea.innerHTML = progressHTML;
    if (loaded == total) {
      progressArea.innerHTML = "";
      let uploadedHTML = `<li class="row">
                            <div class="content upload">
                              <i class="fas fa-file-alt"></i>
                              <div class="details">
                                <span class="name">${dro_file} • 上传完成</span>
                                <span class="size">${fileSize}</span>
                              </div>
                            </div>
                            <i class="fas fa-check"></i>
                          </li>`;
      uploadedArea.classList.remove("onprogress");
      uploadedArea.insertAdjacentHTML("afterbegin", uploadedHTML);
    }
  });
  ajax_request.send(form_data);
}




function uploadFile(name) {
  let xhr = new XMLHttpRequest();
  xhr.open("POST", "/upload");
  xhr.upload.addEventListener("progress", ({ loaded, total }) => {
    let fileLoaded = Math.floor((loaded / total) * 100);
    let fileTotal = Math.floor(total / 1000);
    let fileSize;
    (fileTotal < 1024) ? fileSize = fileTotal + " KB" : fileSize = (loaded / (1024 * 1024)).toFixed(2) + " MB";
    let progressHTML = `<li class="row">
                          <i class="fas fa-file-alt"></i>
                          <div class="content">
                            <div class="details">
                              <span class="name">${name} • 上传中</span>
                              <span class="percent">${fileLoaded}%</span>
                            </div>
                            <div class="progress-bar">
                              <div class="progress" style="width: ${fileLoaded}%"></div>
                            </div>
                          </div>
                        </li>`;
    uploadedArea.classList.add("onprogress");
    progressArea.innerHTML = progressHTML;
    if (loaded == total) {
      progressArea.innerHTML = "";
      let uploadedHTML = `<li class="row">
                            <div class="content upload">
                              <i class="fas fa-file-alt"></i>
                              <div class="details">
                                <span class="name">${name} • 上传完成</span>
                                <span class="size">${fileSize}</span>
                              </div>
                            </div>
                            <i class="fas fa-check"></i>
                          </li>`;
      uploadedArea.classList.remove("onprogress");
      uploadedArea.insertAdjacentHTML("afterbegin", uploadedHTML);
    }
  });
  let data = new FormData(form);
  xhr.send(data);
}
