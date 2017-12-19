
//模拟渲染
var render = function (data, curr) {
    var arr = []
    , thisData = data.concat().splice(curr * nums - nums, nums);
    layui.each(thisData, function (index, item) {
        arr.push('<li>' + item + '</li>');
    });
    return arr.join('');
};

var laypage = undefined;
jQuery.fn.LDataGrid = function (e) {
    var pdg = new LDataGrid();
    pdg.jq_obj = this;
    pdg.trTmpl = pdg.jq_obj.find('tbody').html();
    pdg.jq_obj.find('tbody').html('');
    if (e.rows != undefined) {
        pdg.rows = e.rows
    }
    if (e.page != undefined) {
        pdg.page = e.page
    }
    if (e.paging == true) {
        pdg.paging = true;
        var pageDiv = '<div id="pagebar" class="pageingContext"></div>\n';
        // 放入分页footbar
        $(pageDiv).insertAfter($(this));
        layui.use(['laypage', 'layer'], function () {
            laypage = layui.laypage
            , layer = layui.layer;

            laypage({
                cont: 'pagebar',
                curr: pdg.page
              , pages: 0 //总页数
              , groups: 5 //连续显示分页数
            });
        });
    }
    pdg.url = e.url;

    return pdg;
};

function LDataGrid() { };
LDataGrid.fn = LDataGrid.prototype;
LDataGrid.fn.jq_obj = undefined;
LDataGrid.fn.total = 0;
LDataGrid.fn.rows = 10;
LDataGrid.fn.page = 1;
LDataGrid.fn.total = 0;
LDataGrid.fn.url = '';
LDataGrid.fn.paging = false;
LDataGrid.fn.rowsData = undefined;
LDataGrid.fn.QueryParams = function () {
    return {};
};
LDataGrid.fn.trTmpl = '';
LDataGrid.fn.LineFormatter = function (dr) {
    dr._index = dr.index;
    return LineBind(this.trTmpl, dr, 'dr');
};
/**
 * 逐行绑定
 * template: 数据模版
 * item: 本行数据对象
 * varname: 循环变量
 */
function LineBind(template, item, varname) {
    var line = template.toString();
    for (; line.indexOf('${') > -1 ;) {
        var el = line.substring(line.indexOf('${'), line.indexOf('}$', line.indexOf('${')) + 2);
        line = line.replace(el, function () {
            return ElInterpret(item, el, varname);
        });
    }
    return line;
}

/**
 * 执行el表达式并反馈执行结果
 * item: 本行数据对象
 * el: 需要执行的el表达式
 * varname: 循环变量
 */
function ElInterpret(item, el, varname) {
    el = el.substring(2, el.length - 2);
    if (varname == undefined) {
        return eval(el);
    } else {
        el = 'var ' + varname + ' = item; \n' + el;
        return eval(el);
    }

}
LDataGrid.fn.LoadComplete = function (dr) {

};

var loadingLayIndex;
var layerInfo;
var tempindex;
LDataGrid.fn.LoadData = function () {
    var postdata = this.QueryParams();
    if (postdata == false)
        return;
    postdata.rows = this.rows;
    postdata.page = this.page;
    layui.use('layer', function () {
        layerInfo = layui.layer;
        tempindex = layerInfo.load(2);
    });
    
    var pdg = this;
    $.ajax(
        {
            url: this.url,
            type: 'post',
            data: postdata,
            dataType: 'json',
            success: function (data) {

                console.log(data);
                if (data.state == 1) {
                    pdg.total = data.total;
                    var tbody = pdg.jq_obj.find('tbody');
                    tbody.html('');

                    pdg.rowsData = data.rows;
                    var tbodyhtml = '';
                    var index = (pdg.page - 1) * pdg.rows;
                    for (var i in data.rows) {
                        index++;
                        var dr = data.rows[i];
                        dr.index = index;
                        tbodyhtml += pdg.LineFormatter(dr);
                    }
                    tbody.html(tbodyhtml);
                    if (pdg.paging == true) {
                        var maxPage = pdg.total < 1 ? 1 : Math.ceil(pdg.total / pdg.rows);
                        laypage({
                            cont: 'pagebar',
                            curr: pdg.page
                          , pages: maxPage //总页数
                          , groups: 5, //连续显示分页数
                            jump: function (obj, first) {
                                //得到了当前页，用于向服务端请求对应数据
                                if (!first) {
                                    var curr = obj.curr;
                                    pdg.page = curr;
                                    pdg.LoadPage(curr);
                                }
                            }
                        });
                    }
                    layui.use('form', function () {
                        var $ = layui.jquery, form = layui.form();
                        //全选
                        form.on('checkbox(allChoose)', function (data) {
                            var child = $(data.elem).parents('table').find('tbody input[type="checkbox"]');
                            child.each(function (index, item) {
                                item.checked = data.elem.checked;
                            });
                            form.render('checkbox');
                        });

                    });
                    pdg.LoadComplete();
                    LMsgOK('加载完成');
                } else {
                    LMsgOK(data.txt);
                }
            },
            error: function () {
                LMsgError('通讯错误');
            },
            beforeSend: function () {
            },
            complete: function () {
                layerInfo.close(tempindex);
            }
        }
    );
};

function LMsgOK(text)
{
    layer.msg(text, { icon: 6, time: 2000 }, function (index) {
        //layer.close(layer);
    });
}

function LMsgError(text) {
    layer.msg(text, { icon: 5, time: 2000 }, function (index) {
        //layer.close(layer);
    });
}

LDataGrid.fn.Load = function () {
    this.page = 1;
    this.LoadData();
};
LDataGrid.fn.LoadPage = function (page) {
    var maxPage = this.total < 1 ? 1 : Math.ceil(this.total / this.rows);
    if (maxPage < page || 1 > page) {
        LMsgError('请输入有效的页码值');
        return;
    }
    this.page = page;
    this.LoadData();
};
LDataGrid.fn.LoadPrev = function () {
    if (this.page > 1) {
        this.page = this.page - 1;
        this.LoadData();
    }
};
LDataGrid.fn.LoadNext = function () {
    var maxPage = this.total < 1 ? 1 : Math.ceil(this.total / this.rows);
    if (maxPage > this.page) {
        this.page = this.page + 1;
        this.LoadData();
    }
};

LDataGrid.fn.LineFormatter = function (dr) {
    dr._index = dr.index;
    return LineBind(this.trTmpl, dr, 'dr');
};


/// <reference path="jquery-1.10.2.min.js" />
function jsonDateFormat(jsonDate) {//json日期格式转换为正常格式
    try {
        var date = new Date(parseInt(jsonDate.replace("/Date(", "").replace(")/", ""), 10));
        var month = date.getMonth() + 1 < 10 ? "0" + (date.getMonth() + 1) : date.getMonth() + 1;
        var day = date.getDate() < 10 ? "0" + date.getDate() : date.getDate();
        var hours = date.getHours();
        var minutes = date.getMinutes();
        var seconds = date.getSeconds();
        var milliseconds = date.getMilliseconds();
        return date.getFullYear() + "-" + month + "-" + day + " " + hours + ":" + minutes + ":" + seconds + "." + milliseconds;
    } catch (ex) {
        return "";
    }
}

jQuery.fn.ShowDiglog = function (e)
{
    alert("ShowDiglog");
}

jQuery.extend({
    ShowDiglog: function (e) {
        //自定页
        layer.open({
            title:e.title,
            type: 2,
            closeBtn: 1, //不显示关闭按钮
            anim: 2,
            shadeClose: false, //开启遮罩关闭
            content: [e.url, 'no'],
            btn: e.bottons,
            area: e.area,
            yes: function (index, layero) {
                //当点击‘确定’按钮的时候，获取弹出层返回的值
                var res = window["layui-layer-iframe" + index].callbackdata();
                //打印返回的值，看是否有我们想返回的值。
                console.log(res);
                if (e.ok && typeof e.ok == "function") {
                    e.ok(res);
                }
                layer.close(index); //如果设定了yes回调，需进行手工关闭
            },
            btn2: function(index, layero){
                layer.close(index);
            }
        });
    }
});