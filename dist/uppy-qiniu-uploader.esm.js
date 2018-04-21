/**
 * uppy-qiniu-uploader v0.0.2
 * (c) 2018 zhuoqi_chen@126.com
 * @license MIT
 */
import Plugin from 'uppy/lib/core/Plugin';
import { upload } from 'qiniu-js';

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _Promise = typeof Promise === 'undefined' ? require('es6-promise').Promise : Promise;

var Qiniu = function (_Plugin) {
  _inherits(Qiniu, _Plugin);

  function Qiniu(uppy, opts) {
    _classCallCheck(this, Qiniu);

    var _this = _possibleConstructorReturn(this, _Plugin.call(this, uppy, opts));

    _this.id = opts.id || 'Qiniu';
    _this.type = 'uploader';
    _this.getToken = opts.getToken || function () {};
    _this.host = opts.host || '';
    _this.Uploader = _this.Uploader.bind(_this);
    return _this;
  }

  Qiniu.prototype.uploadFiles = function uploadFiles(files) {
    var _this2 = this;

    var me = this;
    var filesPromise = files.map(function (file) {
      return new _Promise(function (resolve, reject) {
        var observable = upload(file.data, file.name, _this2.getToken());
        var observer = {
          next: function next(res) {
            me.uppy.emit('upload-progress', file, {
              uploader: me,
              bytesUploaded: res.total.loaded,
              bytesTotal: res.total.size
            });
          },
          error: function error(err) {
            reject(err);
          },
          complete: function complete(res) {
            me.uppy.emit('upload-success', file, res, me.host + '/' + res.key);
            resolve();
          }
        };
        observable.subscribe(observer);
        me.uppy.emit('upload-started', file);
      });
    });
    return _Promise.all(filesPromise);
  };

  Qiniu.prototype.Uploader = function Uploader(fileIDs) {
    var _this3 = this;

    var files = fileIDs.map(function (fileID) {
      return _this3.uppy.getFile(fileID);
    });
    return this.uploadFiles(files);
  };

  Qiniu.prototype.install = function install() {
    this.uppy.addUploader(this.Uploader);
  };

  Qiniu.prototype.uninstall = function uninstall() {
    this.uppy.removeUploader(this.Uploader);
  };

  return Qiniu;
}(Plugin);

export default Qiniu;