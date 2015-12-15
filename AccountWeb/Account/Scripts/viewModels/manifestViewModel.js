﻿/// <reference path="../util.js" />
/// <reference path="../knockout-3.3.0.js" />
/// <reference path="../moment.min.js" />
/// <reference path="addOrUpdateManifestViewModel.js" />
/// <reference path="../jquery-1.9.1.min.js" />

//日消费明细ViewModel
function ManifestViewModel() {
    var self = this;
    var currentManifest = null;
    this.beginDate = ko.observable(moment().add(-1, "months").format("YYYY-MM-DD"));
    this.endDate = ko.observable(moment().format("YYYY-MM-DD"));
    this.manifests = ko.observableArray();
    this.count = ko.computed(function () {
        return self.manifests().length;
    });
    this.date = ko.observable();
    this.cost = ko.observable();
    this.remark = ko.observable();
    this.operateTitle = ko.observable();
    this.getManifest = function () {
        sendAjaxRequest("GET", "/api/Manifests",
            {
                begin: this.beginDate(),
                end: this.endDate()
            },
            function (err, res) {
                if (err) {
                    return alert("获取消费明细失败：" + err);
                }
                self.manifests(res);
                if(!res || res.length === 0){
                    alert("未查询到消费明细");
                }
            });
    };
    $("#modalManifest").on("hidden.bs.modal", function () {
        self.date(null).cost(null).remark(null);
        self.currentManifest = null;
    });
    this.addManifest = function () {
        self.operateTitle("添加消费明细");
        self.date(moment().format("YYYY-MM-DD"));
        $("#modalManifest").modal("show");
    };
    this.saveManifest = function () {
        var id = self.currentManifest ? self.currentManifest.ID : Guid.NewGuid().ToString();
        var data = {
            ID: id,
            Date: self.date(),
            Cost: self.cost(),
            Remark: self.remark()
        };
        if (self.currentManifest == null) {
            sendAjaxRequest("POST", "/api/Manifests", data,
                function (err, res) {
                    if (err) {
                        alert("添加失败");
                    }
                    else {
                        self.manifests.push(data);
                        $("#modalManifest").modal("hide");
                        var event = {
                            type: "refresh",
                            message: "添加消费明细了！"
                        };
                        window.customEvent.trigger(event);
                        alert("添加成功");
                    }
                });
        }
        else {
            sendAjaxRequest("PUT", "/api/Manifests", data,
                function (err, res) {
                    if(err){
                        alert("更新失败" + err);
                    }
                    else {
                        self.manifests.replace(self.currentManifest, data);
                        $("#modalManifest").modal("hide");
                        var event = {
                            type: "refresh",
                            message: "更新消费明细了！"
                        };
                        window.customEvent.trigger(event);
                        alert("更新成功");
                    }
                });
        }
    };
    this.editManifest = function (data) {
        self.operateTitle("编辑消费明细");
        self.currentManifest = data;
        self.date(moment(data.Date).format("YYYY-MM-DD")).cost(data.Cost).remark(data.Remark);
        $("#modalManifest").modal("show");
    };
    this.deleteManfest = function (data) {
        sendAjaxRequest("DELETE", "/api/Manifests/" + data.ID,
            null,
            function (err, res) {
                if (err) {
                    return alert("删除出错");
                }
                else {
                    self.manifests.remove(data);
                    var event = {
                        type: "refresh",
                        message: data.toString() + "的消费明细被删除！"
                    };
                    window.customEvent.trigger(event);
                    alert("删除成功");
                }
            });
    };
    this.getManifest();
};
