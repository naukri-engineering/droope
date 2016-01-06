/*Version droope_v1.1.0*/
var DD = function(obj, sts, key) {
    var X = this;
    var defWth_fx = 30;
    X.obj = obj;
    var defWth = X.obj.postPlaceholder ? X.obj.postPlaceholder.width : 30;
    X.parentRefData = {};
    X.liCntrFx = [];
    X.preventClickFor = obj.preventClickFor || [];
    X.onDeselect = obj.onDeselect;
    X.liCntr = [];
    X.isReset = true; // to enable/disabled reset for replace or add data
    X.sortPrefix = obj.sortPrefix;
    X.hidValue = [];
    X.maxTagsCount = obj.maxTagsCount || 999;
    X.pKey = key;
    X.tagwithOptGroup = obj.tagwithOptGroup || false;
    X.srchBx = obj.searchBox === false ? false : true;
    X.clrId = obj.clearTagId;
    X.tagsSorting = obj.tagsSorting === false ? false : true;
    X.MrgPrfAryOrdr = obj.appendTags || false;
    X.onClearTag = []; // call back function for click on clearTag/clearAllTsg
    X.sugHgt = obj.maxHeight || 300;
    X.clearAllInside = obj.clearAllInside || false;
    X.parentChkBox = obj.parentChkBox || false;
    X.chkBox = obj.checkBox || false;
    X.allChk = obj.allChk || false;
    X.layerOpenStatus = false;
    X.tags = obj.tags === false ? obj.tags : true;
    X.TagSpCnt = obj.tagInSepContainer || false;
    X.inputValReset = obj.inputValReset === false ? false : true;

    X.id = obj.id;

    X.preTxt = obj.preText === false ? '' : obj.preText || 'You have selected';
    X.Allflg = '';
    X.postTxt = obj.postText === false ? '' : obj.postText || 'item(s)';
    X.curActElm = '';
    X.Tagfocus = 0;
    X.onClickLi = obj.onClickReq || emptyCalBckFun();
    X.onTagClk = obj.onTagClick || emptyCalBckFun(); //Call back function on tag click
    X.onTagCrt = obj.onTagCreate || emptyCalBckFun(); //call when tag create
    X.outerCont = $('#' + X.id);
    X.inpElm = X.outerCont.find('.srchTxt');
    X.TagCnt = 0;
    X.tagTitle = obj.tagTitle || false;
    X.optgrpNameRef = [];
    X.optgrpObject = {};
    X.onChange = obj.onChange || emptyCalBckFun();

    /*Add new data parameter with legacy support*/
    X.dataObj = obj.data || (obj.id && obj.id[X.id] ? obj.id[X.id][0] : "");

    /**
     * [X.Ary: to store json data object]
     * @type {Object}
     */
    if (!X.pKey) {
        X.Ary = {};
        X.Ary['A'] = X.dataObj;
    } else {
        if (!X.chkBox) DD.Ary[X.id] = {};
        if (!DD.Ary[X.id]) DD.Ary[X.id] = {};
        DD.Ary[X.id][X.pKey] = X.dataObj;
        X.Ary = DD.Ary[X.id];
    }

    /**
     * [prefillData : to store prefill Data, with legacy support]
     * @type {[Array or string]}
     */
    X.prefillData = obj.prefillData || (X.obj.id[X.id] ? X.obj.id[X.id][1] : '');


    /**
     * [isSearch description] : for Disable search feature in single Select Case
     * @type {Boolean}
     */
    X.isSearch = obj.isSearch == false ? false : true;



    function emptyCalBckFun() {
        return arguments.length ? function(arguments) {} : function() {};
    }


    /*Bind Click event on document on Click*/
    if (!DD.lastRef['iseventBindOnDocument']) {
        $(document).on('click.dd', function(e) {
            var ddNode = $(e.target).parents('.ddwn');
            if (!ddNode.length && Boolean(ddNode.attr('searchDisabled')) !== true) {
                ddNode.find('.DDwrap').removeClass('brBotN');
                ddNode.find('.drop').hide();
            }
        });
        DD.lastRef['iseventBindOnDocument'] = true;
    }
    /*End of Bind Click event on document on Click*/


    var tagsToReplace = function(tag) {
        return tag.replace(/>/g, '&gt;').replace(/</g, '&lt;');

    }

    /**
     * [replaceTag description]
     * @param  {[type]} tag [string]
     * @return {[string]}     [escape HTML tags as HTML entities]
     */

    // function to break string at <b> & </b> and then replace '<,>,&' in string if found
    // it will return the string after adding back <b> & </b> at the required position
    var breakStringForBold = function(tag) {
        if (tag.indexOf('<b>') != -1) {
            tag = tag.split('<b>'); //breaking string at <b>
            var strAfter = tag[1].split('</b>'), //breaking string after <b> into two parts furthur to get string before & after </b>
                arr = [
                    tag[0], // string before <b>
                    strAfter[0], // string before </b>
                    strAfter[1] // string after </b>
                ],
                arrNew = [];

            for (var i in arr) {
                arrNew.push(tagsToReplace(arr[i]));
            }

            return arrNew[0] + '<b>' + arrNew[1] + '</b>' + arrNew[2];
        } else {
            return tagsToReplace(tag);
        }
    }



    X.replaceTag = function(tag) {
        return (tag.toString().indexOf('<') != -1) ? breakStringForBold(tag) : tag;
    }



    //creating li is current number of li is less than actual
    X.setLi = function(id) {
        var X = this;
        if ($('#ul_' + id).find('li').length < X.liCntr) {
            var html = X.appendData(X.Ary, '', '', true);
            X.dpLyr.find('ul').html(html[0]);
            X.liCntr = X.liCntrFx;
        }
    }

    if (X.obj.resetPrefillValues) { // to reset(empty checkBox Container) values to avoid prefill case... used in SM
        X.ChkBoxContr = {};
    } else {
        !X.ChkBoxContr ? X.ChkBoxContr = {} : '';
    }

    for (var x in obj.clearTagId) {
        for (var y in obj.clearTagId[x]) {
            X.onClearTag[x] = obj.clearTagId[x][y];
        }
    }

    X.Fn = {
        preserveEventafterClone: function(Id, bool) {
            var id = X.id,
                tagElm;
            if (X.TagSpCnt) {
                tagElm = $('#' + X.TagSpCnt).find('[data-id="' + Id + '"]');
            } else {
                tagElm = $('#' + id).find('.DDsearch').find('[data-id="' + Id + '"]');
            }
            tagElm.on('click', '.dCross', function(e) { //remove tags by click on tag cross button  
                e.stopPropagation();
                X.removeTag(Id, $(this).find('.tagTxt').text(), bool);
                X.max_height();
                bool ? X.onTagClk(obj, X.TagCnt) : '';
                X.setInputText(); // for decrement count value when user click on tag cross sign
                X.dpLyr.css('display') == "block" ? $('#' + id).find('.srchTxt')[0].focus() : '';
            });
        },
        keyUpEv: function(e) { //must be put code at key_up event           
            var id = $(this).data('id'),
                maxWth = $('#' + id).width() - 15,
                iD = id.split('_')[1],
                kCd = e.keyCode || e.which;

            var ddTxtVal = $(this).val().replace(/\b/g, '');
            if (kCd == 13 && X.curActElm && X.curActElm.length && !X.curActElm.hasClass('noData')) { // create tag on enter
                if (X.curActElm.hasClass('active')) {
                    var anchorTxt = X.curActElm.children('a');
                    if (X.chkBox) {
                        var tagid = anchorTxt.data('id') + '_' + X.Escp(X.curActElm.attr('bindto'));
                        if (anchorTxt.hasClass('chkd')) {
                            X.removeTag('tg_' + tagid, anchorTxt.html(), true);
                        } else {
                            X.CreateTags(anchorTxt, tagid, '', X.tags);
                        }
                    } else {
                        X.SingleSelection(anchorTxt.text(), anchorTxt.data('id').split('_'));
                        X.hideDD();
                    }
                }
            }
            if (kCd == 8) {
                if (X.chkBox && !X.TagSpCnt && X.tags !== false) {
                    if (ddTxtVal) {
                        wth = DecreaseTxtBoxWth(id, maxWth) + 'px';
                    } else {
                        if (X.inpHid.val() != "") {
                            wth = defWth + 'px';
                        } else {
                            wth = '';
                        }
                    }
                    X.inpElm.css({
                        width: wth
                    });
                }
            }

            if (kCd != 9 && kCd != 13 && kCd != 18 && kCd != 32 && kCd != 37 && kCd != 38 && kCd != 39 && kCd != 40 && kCd != 16) {
                X.Fn.initSearch(ddTxtVal, id, kCd);
                if (X.dpLyr.css('display') == "none") {
                    X.dpLyr.show();
                }
            }
        },

        initSearch: function(sTxtValue, id, kCd) {
            var html = '';
            srchCntr = 0;
            id = id.split('_')[1];
            var Ary = X.Ary;
            if (sTxtValue) {
                sTxtValue = sTxtValue.replace(/&amp;/gi, '&').replace(/[\s]+/g, " ").replace(/^\s/, "");
                for (var K in Ary) {
                    for (var Q in Ary[K]) {
                        if (typeof Ary[K][Q] === 'object') { // for optgroup case           
                            var Li = '',
                                dObj;
                            dObj = Ary[K][Q];
                            for (var m in dObj) {
                                Li += X.searchData(dObj[m], sTxtValue, id, id + '_' + m + '_' + X.eUnderScore(Q), X.Escp(K));
                            }
                            if (Li) {
                                html += '<li class="optgroup">' + X.eUnderScore(Q) + '</li>' + Li;
                                srchCntr++;
                            }
                        } else { // for single case
                            $('#' + id).find('.cross').show();
                            html += X.searchData(Ary[K][Q], sTxtValue, id, id + '_' + X.eUnderScore(Q), X.Escp(K));
                            srchCntr++;
                        }
                    }

                }
            } else {
                $('#' + id).find('.cross').hide();
                html = X.appendData(X.Ary, '', '', kCd)[0];
                srchCntr = X.liCntrFx;
            }
            if (!html) {
                var txt = X.obj.noDataTxt ? X.obj.noDataTxt : "No data found in search";
                html = '<li class="noData">' + txt + '</li>';
                srchCntr++;
            }
            X.dpLyr.find('ul').html(html);
            X.liCntr = srchCntr;
            X.max_height();
            X.firstHighlight();

        }
    };

    function init(e) {

        var id = X.id,
            clrAll, ifr;

        if (X.clearAllInside) {
            var text = 'Clear All';
            for (var x in X.clearAllInside) {
                text = X.clearAllInside[x];
            }
            clrAll = $('<div>').addClass('DDclearAll').attr({
                id: 'clrAll_' + id
            }).html(text);
        }
        var srchTxt = $('#' + id).find('.srchTxt');
        if (!X.dpLyr || !X.dpLyr.length) { // to prevent create multiple drop loyer if same call initialize.

            var nm = srchTxt.attr('name');
            srchTxt.data({
                'name': nm
            }); // to reset in destroy function
            var arrow = $('#' + id).find('.arw').addClass('DDarwDwn'),
                movToLi;


            if (X.chkBox) {
                movToLi = $('#' + id).find('.DDsearch li');
            } else {
                movToLi = $('#' + id).find('.DDsearch');
                $('#' + id).addClass('singleSelect')
            }

            srchTxt.data({
                'id': 'inp_' + id,
                'placeholder': srchTxt.attr('placeholder')
            }).attr({
                'name': '',
                'autocomplete': 'off'
            });

            if (!X.isSearch) srchTxt.attr('readonly', 'readonly');

            X.outerCont.find('.frst').css({
                'float': 'none'
            });

            if (!$('#hid_' + id).length) { // create hidden input field if it's not aleredy there
                X.inpHid = $('<input>').attr({
                    type: "hidden",
                    id: "hid_" + id,
                    name: nm
                });
                movToLi.append(X.inpHid);
            }
            var drop = $('<div>'),
                scrollWrap = $('<div>'),
                ul = $('<ul>'),
                ddCont = $('#' + id),
                checkbox = X.chkBox ? 'ChkboxEnb' : '';

            X.dpLyr = drop; // store reference of dropLayer container
            scrollWrap.addClass('nScroll').attr('id', 'ul_' + id);
            drop.addClass('drop').attr('id', 'dp_' + id);
            ul.addClass(checkbox);
            scrollWrap.append(ul);
            clrAll ? drop.append(clrAll) : '';
            drop.append(scrollWrap);
            ddCont.append(drop);
            

            $('#' + id).on('click', '.DDinputWrap, .DDsearch, .arw', function(e) {
                e.stopPropagation();
                srchTxt[0].focus();
            }).on('mouseenter', function() {
                X.layerOpenStatus = (X.srchBx !== false) ? true : false;
            }).on('mouseleave', function() {
                X.layerOpenStatus = false;
            });
        }

        //Add events in dropDown
        srchTxt.on('focus', focusEv).on('keydown', function(e) {
            keyDownEv(e, $(this));
        }).on('keyup', X.Fn.keyUpEv).on('blur', blurEv);
        X.layerOpenStatus = (X.srchBx !== false) ? true : false;
        


        X.fillData(); // to append data dynamically at run time in Dropdown     

        function clearHandler(XclrId) {
            return function() {
                var clrid = $(this).attr('id');
                var param = XclrId[clrid];
                var Ides = param['id'];
                if (Ides) {
                    for (var y in Ides) {
                        var id = Ides[y];

                        //X.inpHid.attr('value','');
                        if (X.chkBox) {
                            X.removeAllTags();
                        } else {
                            X.inpElm.val('');
                            X.inpHid.data('optGroupKey', '');
                        }
                        X.Allflg = '';
                        X.hideDD();
                        
                    }
                }
                if (param['clrCalbackfun']) {
                    X.onClearTag[clrid](X.obj, 0, $(this));
                }
            };
        }

        if (X.clrId) { // clear all tags and data on html tag fire event            
            for (var x in X.clrId) {
                $('#' + x).on('click', clearHandler(X.clrId));
            }
        }
    }

    function blurEv(e) {
        var id = X.id;
        !X.TagSpCnt && X.chkBox ? $('#' + id).find('.tagit:last').removeClass('TagSelected') : '';

        if (!X.layerOpenStatus) {
            X.hideDD();
        }
        if (!X.chkBox) {
            var hd = X.inpHid,
                inp = X.inpElm;
            var rr = X.uEscp(hd.attr('opt'));
            var val = hd.attr('value');
            var dataAry = X.Ary['A'];
            var txt = rr ? dataAry[rr][val] : dataAry ? dataAry[val] : '';
            if (!inp.val()) {
                hd.val('');
                if (X.dpLyr.css('display') == "none") {
                    X.onChange('');
                }
                if (X.onDeselect) X.onDeselect();
            } else if (txt) {
                inp.val(txt).css({
                    'color': '#444'
                });
            }
        }
    }

    function focusEv(e) { //It fires when focus comes in dropdown text box

        X.layerOpenStatus = (X.srchBx !== false) ? true : false;
        X.inpt = $(this);

        var id = $(this).data('id'),
            iD = id.split('_')[1];
        X.DDSearch = $(this).parent('.DDSearch');
        showDD();
        $('#' + id).css({
            'color': '#444'
        });
    }

    function keyDownEv(e, inpElm) {
        var wth, 
            id = X.id,
            kCd = e.keyCode || e.which,
            maxWth = $('#' + id).width() - 15,
            ddTxtVal = inpElm.val().replace(/\b/g, '');

        var dropDisp = X.dpLyr.css('display');

        if (kCd == 13 || kCd == 38) { //for multiple select
            e.preventDefault();
        }

        if (kCd == 13 && dropDisp == "none" && !X.chkBox && X.obj.form) { // for single select                    
            X.obj.form[0].submit();
        }

        (kCd == 9 || kCd == 27) ? X.hideDD(): ''; // check why it is not work no keyUp                                

        if ((kCd >= 97 && kCd <= 122) || (kCd >= 65 && kCd <= 90) || (kCd >= 48 && kCd <= 57)) {
            if (!X.TagSpCnt && X.chkBox && X.tags !== false) {
                wth = IncreaseTxtBoxWth(maxWth);
                X.inpElm.css({
                    width: wth + 'px'
                });
            }
        }

        if (!ddTxtVal && X.chkBox) { //must be put code at keyDown event          
            var lastTag = $('#' + id).find('.tagit:last'),
                tagId = lastTag.data('id');
            if (X.TagCnt > 0 && e.keyCode == 8 && !X.TagSpCnt && tagId && tagId.length > 0) {
                if (!X.Tagfocus) {
                    $('#' + id).find('.DDsearch').find('[data-id="' + tagId + '"]').addClass('TagSelected');
                    X.Tagfocus = 1;
                } else {
                    X.removeTag(tagId, lastTag.children('.tagTxt').html(), true);
                    X.Tagfocus = 0;
                }
            } else if (tagId) {
                $('#' + id).find('.DDsearch').find('[data-id="' + tagId + '"]').removeClass('TagSelected');
                X.Tagfocus = 0;
            }
        }
        //var ulCont_hghtCont = $('#dp_'+id);
        var ulCont_parent = $('#ul_' + id)
        var ulCont = ulCont_parent.find('ul');
        var firstElm = ulCont.find('li:first-child');

        if (!X.curActElm.length) {
            X.curActElm = firstElm;
        }

        if (kCd == 40) { // down arrow key
            if (dropDisp == "none") {
                X.hideDD();
                showDD();
            } else {
                var node, nodeRef = X.curActElm.next();
                if (nodeRef.length && !nodeRef.hasClass('noData')) {
                    node = nodeRef.hasClass('optgroup') ? nodeRef.next() : nodeRef;
                    X.curActElm.removeClass('active');
                    node.addClass('active');
                    X.curActElm = node;
                    ieObj.scrollHandler(X.dpLyr, ulCont.parent(), firstElm, X.curActElm);
                }
            }
        } else if (kCd == 38) { // up arrow key
            var _node, _nodeRef = X.curActElm.prev();
            if (_nodeRef.length) {
                _node = _nodeRef.hasClass('optgroup') ? _nodeRef.prev() : _nodeRef;
                if (_node.length) {
                    X.curActElm.removeClass('active');
                    _node.addClass('active');
                    X.curActElm = _node;

                    ieObj.scrollHandler(X.dpLyr, ulCont.parent(), firstElm, X.curActElm);
                }
            }
        }
    }

    X.fillDatainDropdwonLayer = function(id, html, i, inpTxt, opt) {
        var sRtx = X.inpElm;
        if (X.chkBox) {
            X.inpHid.attr({
                'value': ''
            });
        }
        if (X.srchBx === false) {
            $('#' + id).attr('searchDisabled', true).find('.DDwrap').hide();
            $('#' + id).find('.drop').css({
                'position': 'static'
            });
        } else {
            $('#' + id).find('div.drop').css({
                'borderTop': 0
            });
        }
        $('#ul_' + id).find('ul').html(html);
        html = '';
        X.srchBx === false ? showDD() : '';
        X.chkForParent(X.optgrpObject, X.DATA); //Check if all childrens inside a parent are prefill,then check parent(In parentChk case)
    };

    X.liMousehover = function() {
        var id = X.id;
        X.dpLyr.on('mouseover', 'li.pickVal', function() {
            !X.curActElm.length ? X.firstHighlight() : '';
            X.curActElm.removeClass('active');
            $(this).addClass('active');
            X.curActElm = $(this);
        }).on('mouseout', 'a', function() {
            $(this).removeClass('active');
        });
    };

    function showDD() { // show dropdown 
        var id = X.id;
        $('#' + id).find('.DDwrap').addClass('brBotN');
        $('#' + id).find('.drop').show();
        $('#ul_' + id)[0].scrollTop = 0;
        var wth = $('#' + id).outerWidth() + 'px';
        X.dpLyr.css({
            'width': wth
        });
        X.max_height();
        if (!X.chkBox) {
            X.firstHighlight();
        };

    };

    X.max_height = function() { // set max heigh of dropdown according to the user specified if user not specified the set default maximum height                       
        var id = X.id,
            k = $('#ul_' + id),

            liHgt = 0,
            li = $('#ul_' + id).find(' ul li:first');
        while (li.length && X.sugHgt >= liHgt) {
            liHgt += li.outerHeight();
            li = li.next();
        }

        if (X.sugHgt < liHgt) {
            k.css({
                height: X.sugHgt + 'px'
            });
        } else {
            k.css({
                height: liHgt + 'px',
                'width': '100%'
            });
        }
        if (k.length && k[0].csb) {
            k[0].csb.reset();
        }
    };

    X.PickValuesFromDD = function() { // On selection it select the data from the dropdown and throw to specific(on the basic of ID) text field or or any HTML tag eg. Div, span, textarea          
        var q,
            t = '', // must be initialize here
            td = X.id;

        X.dpLyr.on('click', '.pickVal a', function(e) {
            if (X.chkBox) {
                var z = 0,
                    aTag = $(this),
                    aId = aTag.data('id');
                if ($(this).hasClass('chkd')) {
                    z = 1;
                }
                q = aTag.html();
                if (aId.split('_')[1] == X.eUnderScore(X.otherLabId)) {
                    if (z == 1) {
                        X.onClickLi(obj, X.otherLabId, 'unChecked');
                    } else {
                        X.onClickLi(obj, X.otherLabId, 'checked');
                    }
                    X.hideDD();
                } else {
                    if (z == 1) {
                        var tgId = aId;
                        if ($(this).parent().attr('bindto')) {
                            tgId = aId + '_' + X.Escp($(this).parent().attr('bindto'));
                        }
                        X.removeTag('tg_' + tgId, q, true);
                    } else {
                        var bnd = $(this).parent().attr('bindto');
                        bnd ? aId = aId + '_' + X.Escp(bnd) : '';
                        X.CreateTags(aTag, aId, '', X.tags);
                    }
                    X.srchBx !== false ? setTimeout(function() {
                        X.inpElm[0].focus();
                    }, 100) : '';
                    if (X.parentChkBox) {
                        var path = $(this).data('id').split('_');
                        var par = path[path.length - 1];
                        var count = 0;
                        if (!X.parentRefData[par]) {
                            var parnt = $(this).parent().prevAll('li.optgroup:first');
                            var arr = parnt.nextUntil('.optgroup').toArray();
                            X.parentRefData[par] = arr;
                        }
                        for (var key in X.parentRefData[par]) {
                            if ($(X.parentRefData[par][key]).find('a').hasClass('chkd')) {
                                count++;
                            }
                            if (count == X.parentRefData[par].length) {
                                //($('li.optgroup').attr('data-id','opt_'+par).class('chkd');
                                $('li.optgroup[data-id="opt_' + par + '"]').find('a').addClass('chkd');
                            } else {
                                $('li.optgroup[data-id="opt_' + par + '"]').find('a').removeClass('chkd');
                            }
                        }
                    }
                }
            } else {
                X.SingleSelection($(this).text(), $(this).data("id").split('_'));
            }
        });
    };

    X.SingleSelection = function(txt, key) { // when dropdown having a single select functionality  
        var id = key[0],
            opt = key[2] ? key[2] : '';

        X.inpElm ? X.inpElm.val(txt) : '';
        $('#' + id).find('.cross').show();

        var hidValue = X.dUnderScore(X.uEscp(key[1])).replace(X.sortPrefix, '');

        X.inpHid.attr({
            'value': hidValue
        }).data('optGroupKey', opt);

        if (X.layerOpenStatus) X.hideDD();
        X.onClickLi(obj, X.dUnderScore(X.uEscp(key[1])));
        X.onChange(hidValue);
        X.selectedId = hidValue;
    };

    X.CreateTags = function(anchor, t, prfAryindex, tagsFlag) { //checked
        var id = X.id;
        var chk = t.split('_')[1];
        if ($.inArray(chk, X.preventClickFor) == '-1' && (tagsFlag != false)) {
            tagsFlag = true
        } else {
            tagsFlag = false;
        }
        if (X.hidValue.length < X.maxTagsCount) {
            var q, spl = X.uEscp(t).split('_'),
                lianchorTemp = t.split('_'),
                Lianchor = lianchorTemp.length == 3 ? lianchorTemp[0] + '_' + lianchorTemp[1] : lianchorTemp[0] + '_' + lianchorTemp[1] + '_' + lianchorTemp[2];
            if (typeof anchor != "string") {
                q = anchor.html();
                anchor.addClass('chkd');
            } else {
                q = anchor;
            }

            X.TagCnt++;
            X.obj.postPlaceholder && X.obj.postPlaceholder.text ? X.inpElm.attr('placeholder', X.obj.postPlaceholder.text) : X.inpElm.attr('placeholder', '');

            if (tagsFlag !== false) {
                q = q.replace(/(<([^>]+)>)/ig, "").replace(/&amp;/gi, '&');
                X.tagwithOptGroup ? q = '<b>' + spl[2].replace('xSlashX', '/').replace(/SxP/gi, ' ') + '</b>' + '(' + q + ')' : '';
                var optgrpName, selector, li = $('<li>').append('<span class="tagTxt">' + q + '</span>'),
                    Id = 'tg_' + t;
                if (X.tagTitle) {
                    li.attr("title", q);
                }
                var spContId = X.TagSpCnt;
                if (spContId || tagsFlag === false) {
                    var newTag = li.append($('<a>').addClass('dCross')).addClass('tagit').attr({
                            'data-id': Id
                        }),
                        extCont = $('#' + spContId)[0];
                    if (X.MrgPrfAryOrdr) {
                        var refNode = extCont.children[prfAryindex];
                        if (refNode) {
                            refNode.parentNode.insertBefore(newTag[0], refNode);
                        } else {
                            $('#' + spContId).append(newTag);
                        }
                    } else {
                        tagsFlag === false ? '' : extCont.insertBefore(newTag[0], extCont.firstChild);
                    }
                    X.inpElm.css({
                        color: '#444'
                    });
                    selector = Id + ' a.dCross';
                } else {
                    if (X.MrgPrfAryOrdr) {
                        $('#' + id).find('.DDsearch li:last').before(li.append($('<span>').addClass('dCross')).addClass('tagit').attr({
                            'data-id': Id
                        }));
                    } else {
                        $('#' + id).find('.DDsearch').prepend(li.append($('<span>').addClass('dCross')).addClass('tagit').attr({
                            'data-id': Id
                        }));
                    }
                    X.inpElm.css({
                        width: defWth + 'px'
                    });
                    selector = Id + ' span.dCross';
                }
                X.Fn.preserveEventafterClone(Id, true);
            }
            $('#ul_' + X.id).find('[data-id="' + Lianchor + '"]').addClass('chkd');

            X.setValueInHiddenField(spl[1], q);
            X.ChkBoxContr[spl[1]] = t;
            X.onClickLi(obj, X.dUnderScore(X.uEscp(spl[1])), 'Checked', $('li[data-id="tg' + t + '"]'), X.TagCnt);
            X.setInputText();
        } else {
            X.onTagCrt('Maximum Tags Created');
        }

        if (X.tags && !X.TagSpCnt) {
            X.inpElm.val(''); // removing the selected value once the tag is created.
            X.setLi(X.id);
            X.max_height();
        }
    };

    function IncreaseTxtBoxWth(mx) { // increase texbox width while entering the character accordingly
        if (mx > defWth) {
            return defWth += 5;
        } else {
            defWth += 1;
        }
    };

    function DecreaseTxtBoxWth(id, mx) { //Decrease texbox width while removing or deleting the charecter
        if (X.inpElm.val() !== "" && defWth > defWth_fx) {
            if (mx > defWth) {
                return defWth -= 5;
            } else {
                defWth -= 1;
            }
        }
    };

    X.setValueInHiddenField = function(key, txt, isReset) {
        var id = X.id;
        if (key && txt) {
            if (txt.toLowerCase() == "all") {
                X.Allflg = 'all';
            }
            key = X.dUnderScore(X.uEscp(key)).replace(X.sortPrefix, '');
            var hdVal = X.inpHid.val();
            if (!hdVal) {
                X.hidValue.push(key);
                X.inpHid.val(JSON.stringify(X.hidValue));
                $('#clrAll_' + id).show();
                if (X.TagSpCnt) {
                    $('#' + X.TagSpCnt).show();
                } else {
                    $('#' + id).find('li.frst').css({
                        'float': 'left'
                    });
                }
            } else {
                X.hidValue.push(key);
                X.inpHid.val(JSON.stringify(X.hidValue));
            }
            X.onTagCrt();
        } else if (isReset !== false) {
            X.inpElm.val('');
            X.inpHid.val('');
        }
        X.onChange(X.hidValue);
        X.selectedId = X.hidValue;
    };

    init();
    X.PickValuesFromDD(); // Event deligation: event bind for data seelction or tag creation
    X.liMousehover(); // Event Deligation: listing highlight on mouseover
    X.clickParent(); // In parentChk case:: parent click(check/uncheck all childrens)
    X.clickMain(); // In superParent Case:: check/uncheck all values
};

DD.prototype.prefillDataFormation = function(prefillData) {
    var X = this;
    var id = X.id;
    var njson = {};
    if (X.chkBox) {
        if (prefillData) {
            for (var ky in prefillData) {
                njson[prefillData[ky]] = '1';
            }
        }
    } else {
        njson = prefillData;
    }
    return njson;
};

DD.prototype.removeAllTags = function() { //checked
    var X = this;
    var id = X.id;

    for (var x in X.ChkBoxContr) {
        var Id = X.ChkBoxContr[x],
            dep_Id = Id.split('_'),
            newId;

        if (dep_Id.length == 3) {
            newId = dep_Id[0] + '_' + dep_Id[1];
        } else if (dep_Id.length == 4) {
            newId = dep_Id[0] + '_' + dep_Id[1] + '_' + dep_Id[2];
        }
        $('#ul_' + id).find('[data-id="' + newId + '"]').removeClass('chkd');
        if (X.TagSpCnt) {
            $('#' + X.TagSpCnt).find('[data-id="tg_' + Id + '"]').remove();
        } else {
            $('#' + id).find('.DDsearch').find('[data-id="tg_' + Id + '"]').remove();
        }
    }

    if (X.parentChkBox) {
        $('#ul_' + id).find('li a[data-id="' + id + '"]').removeClass('chkd');
    }
    if (X.allChk) {
        $('#ul_' + id).find('li[data-id="opt_all"]').find('a').removeClass('chkd');
    }
    X.resetInpWidth(id);
    X.ChkBoxContr = {};
    X.inpHid.val('');
    X.hidValue = []; // when click on clearon button then it should be removed
    X.TagCnt = 0;
    X.setPlaceHolderAttribute();
};

DD.prototype.destroy = function() {
    var X = this;
    var id = X.id;
    X.dpLyr.remove();
    X.inpHid.remove();
    $('#' + id).find('.DDsearch .tagit').remove();
    X.inpElm.val('').attr({
        'placeholder': X.inpElm.data('placeholder'),
        name: X.inpElm.data('name')
    });
    X.inpElm.removeAttr('autocomplete style')
    X.inpElm.off('focus keydown keyup blur');
};

DD.prototype.removeTag = function(tagId, txt, bool, remId) { //checked
    var X = this,
        id = X.id,
        rep = tagId.replace('tg_', ''),
        tgId = rep.split('_'),
        reqId = $.parseJSON($('#hid_' + id).val()),
        tmp = tgId.length == 4 ? tgId[0] + '_' + tgId[1] + '_' + tgId[2] : tgId[0] + '_' + tgId[1]; // tgId.length=4 for optgroup case
    if ($.inArray(tgId[1], reqId) != -1) {
        $('#ul_' + id).find('[data-id="' + X.Escp(tmp) + '"]').removeClass('chkd');
        if (X.parentChkBox) {
            var a = tmp.split('_');
            a = a[a.length - 1];
            for (key in X.parentRefData[a]) {
                if (!$(X.parentRefData[a][key]).find('a').hasClass('chkd')) {
                    $('#ul_' + id).find('li[data-id="opt_' + a + '"]').find('a').removeClass('chkd');
                    $('#ul_' + id).find('li[data-id="opt_all"]').find('a').removeClass('chkd');
                }
            }
        }
        if (remId) {
            $('#' + remId).remove();
        } else {
            if (X.TagSpCnt) {
                $('#' + X.TagSpCnt).find('[data-id="' + tagId + '"]').remove();
            } else {
                $('#' + id).find('.DDsearch').find('[data-id="' + tagId + '"]').remove();
            }
        }
        X.emptyHidField(rep.split('_')[1], id, txt);
        X.TagCnt--;

        if (!X.TagCnt) {
            X.setPlaceHolderAttribute();
        }
        for (var x in X.ChkBoxContr) {
            if (X.ChkBoxContr[x] == rep) {
                delete X.ChkBoxContr[x];
            }
        }
        bool ? X.onClickLi(X.obj, X.dUnderScore(X.uEscp(tgId[1])), 'Unchecked', '', X.TagCnt) : '';
        X.setInputText();
    };
};

DD.prototype.fillData = function() { //Append Dynamically data to dropdown                          
    var jSonAry = [];
    var _this = this;
    var Id = _this.id;
    var dependentIdKey = [];
    var njson = _this.prefillDataFormation(_this.prefillData);
    jSonAry[Id] = njson;
    var j = 0,
        optBinding = 0;

    if (_this.inpHid.val()) { // when user call dd form at trigger(eg:onClick) many times , then to solve the prefill duplicate problem
        _this.removeAllTags();
    }

    _this.NLi = _this.appendData(_this.Ary, jSonAry, njson);
    _this.fillDatainDropdwonLayer(Id, _this.NLi[0], 0, _this.NLi[3], _this.NLi[4]);
    _this.liCntrFx = _this.liCntr = _this.NLi[1];
    _this.createTags_ifPrefillData(_this.NLi[2]);
}

DD.prototype.appendData = function(DATA, jSonAry, njson, kCd) {
    var html = ''
    var _this = this;
    var id = _this.id;
    var optgroupId;
    var bindKey;
    var Tagcontainer = [],
        inpTxt = '',
        cntr = 0,
        q = 0; /*mustbe Defined null*/

    if (_this.allChk) { // for super parent case
        html += _this.createParLi('all', 'All', '0', true);
    }
    for (var M in DATA) {

        bindKey = M; // to extend data object for addData function
        for (var key in DATA[M]) {

            var mKey = key.replace(_this.sortPrefix, ''); // mKey = modified key (removing sortprifix parameter)
            var KY = _this.eUnderScore(_this.Escp(mKey));

            if (typeof DATA[M][key] === 'object') { //optgroup case

                var pchkd = _this.parentChkBox;
                html += _this.createParLi(KY, key, id, pchkd);

                var unchkarr = [];
                cntr++;
                var arr = [];
                _this.optgrpObject[key] = {};
                _this.optgrpObject[key]['checked'] = arr;
                _this.optgrpObject[key]['unchecked'] = unchkarr;
                for (var m in DATA[M][key]) {

                    if (njson[m] != undefined) {
                        arr.push(m);
                    } else {
                        unchkarr.push(m);
                    }

                    _this.optgrpNameRef[m] = {
                        'pName': key,
                        text: DATA[M][key][m]
                    }; // to determine child belongs in which parent family/optgroup
                    var n = _this.Escp(m);
                    if (jSonAry[id]) {
                        if (jSonAry[id][m]) {
                            var prfKey;
                            parseInt(jSonAry[id][m]) ? prfKey = m : '';
                            if (prfKey === m) {
                                _this.inpVal = m;
                                inpTxt = DATA[M][key][m];
                                var t = M ? id + '_' + n + '_' + KY + '_' + M : id + '_' + n + '_' + KY,
                                    TagData1 = [inpTxt, t, id, n];
                                Tagcontainer[q++] = TagData1;
                                cntr++;
                                html += _this.createLi(id + '_' + n + '_' + KY, DATA[M][key][m], M);
                                optgroupId = KY;
                            }
                        } else {
                            if (njson === m) {
                                _this.inpVal = m;
                                inpTxt = DATA[M][key][m];
                                optgroupId = KY;
                            }
                            cntr++;
                            var chkd = _this.selCheckBox(id, KY, M, n);
                            html += _this.createLi(id + '_' + n + '_' + KY, DATA[M][key][m], M, chkd);

                        }
                    } else {
                        if (njson === m) {
                            _this.inpVal = m;
                            inpTxt = DATA[M][key][m];
                        }
                        var _chkd = _this.selCheckBox(id, KY, M, n);
                        html += _this.createLi(id + '_' + n + '_' + KY, DATA[M][key][m], M, _chkd);
                        cntr++;
                    }
                }
            } else { // without optgroup case case
                _this.optgrpNameRef[key] = {
                    text: DATA[M][key]
                }; // to determine child belongs in which parent family/optgroup

                if (_this.chkBox) { //checkBox Case
                    var _prfKey = '';
                    if (jSonAry && !$.isEmptyObject(jSonAry[id])) {
                        jSonAry[id][mKey] ? _prfKey = mKey : '';
                    }
                    if (_prfKey == mKey) {
                        var _TagData1 = [DATA[M][key], id + '_' + KY + '_' + M, id, key];
                        Tagcontainer[q++] = _TagData1;
                        html += _this.createLi(id + '_' + KY, DATA[M][key], M, '');
                        cntr++;
                    } else {

                        var __chkd = _this.selCheckBox(id, KY, M);
                        html += _this.createLi(id + '_' + KY, DATA[M][key], M, __chkd);
                        cntr++;
                    }

                } else { //single Select without optgroup and without checkbox
                    if (_this.prefillData == mKey) {
                        html += _this.createLi(id + '_' + KY, DATA[M][key]);
                        _this.inpVal = key;
                        inpTxt = DATA[M][key];
                        cntr++;
                        !kCd ? _this.SingleSelection(DATA[M][key], [id, key]) : ''; // for single select dependent case with prefill
                    } else {
                        html += _this.createLi(id + '_' + KY, DATA[M][key]);
                        cntr++;
                    }
                }
            }
        }
    }

    if (!html) {
        var noDatatxt = _this.obj.noDataTxt ? _this.obj.noDataTxt : "No data found in search";
        html = '<li class="noData">' + noDatatxt + '</li>';
    }

    if (_this.chkBox && _this.tagsSorting === false) {
        var newAry = [],
            i = 0;
        for (var x in njson) {
            for (var y in Tagcontainer) {
                if (Tagcontainer[y][3] == x) {
                    newAry[i++] = Tagcontainer[y];
                }
            }
        }
        Tagcontainer = newAry;
    }
    $.extend(_this.Ary[bindKey], DATA[bindKey]);

    return [html, cntr, Tagcontainer, inpTxt, optgroupId];
};

DD.prototype.selectedValues = function(){
    return this.selectedId;
};

DD.prototype.chkForParent = function(optgrpObject, Data) {
    for (var key in optgrpObject) {
        if (optgrpObject[key].unchecked.length == 0) {
            $('li[data-id="opt_' + this.eUnderScore(this.Escp(key)) + '"]').find('a').addClass('chkd');
            $('li[data-id="opt_all"]').find('a').addClass('chkd');
        } else {
            $('li[data-id="opt_all"]').find('a').removeClass('chkd');
        }
    }
};

DD.prototype.Escp = function(key) { // encode key (space : [" "])
    return key ? key.replace(/\s/g, 'SxP') : '';
};

DD.prototype.uEscp = function(key) { // decode key
    return key ? key.replace(/SxP/g, ' ') : false;
};

DD.prototype.eUnderScore = function(str) {
    return str ? str.replace(/\_/g, 'undrxxscr') : '';
};

DD.prototype.dUnderScore = function(str) {
    return str ? str.replace(/undrxxscr/gi, '_') : '';
};

DD.prototype.clickParent = function() { //click event functionality of parent checkbox 
    var X = this; // if parent checkbox is clicked then all its childrens are automatically selected/deselected
    var q,
        t = '', // must be initialize here
        td = X.id;
    $('#ul_' + td).on('click', 'li.optgroup', function() {
        var _this = this;
        var arr = $(this).nextUntil('li.optgroup');
        var lnth = arr.length;
        if (!$(this).children('a').hasClass('chkd')) {
            for (i = 0; i <= lnth; i++) {
                if (!$(arr).eq(i).find('a').hasClass('chkd'))
                    $(arr).eq(i).find('a').click();
            }
            $(_this).children('a').addClass('chkd')

        } else {
            for (i = 0; i <= lnth; i++) {
                if ($(arr).eq(i).find('a').hasClass('chkd'))
                    $(arr).eq(i).find('a').click();
            }
            $(_this).children('a').removeClass('chkd')
        }



    })
};

DD.prototype.clickMain = function() { //click event functionality of parent checkbox 
    var X = this; // if parent checkbox is clicked then all its childrens are automatically selected/deselected
    var q,
        t = '', // must be initialize here
        td = X.id;
    $('#ul_' + td).on('click', 'li.optgroup[data-id="opt_all"]', function(e) {
        e.stopImmediatePropagation();
        var _this = this;
        var arr = $(this).siblings('li.optgroup');
        var lnth = arr.length;
        if ($(this).children('a').hasClass('chkd')) {
            for (j = 0; j <= lnth; j++) {
                if (!$(arr).eq(j).find('a').hasClass('chkd'))
                    $(arr).eq(j).click();
            }
            $(_this).children('a').addClass('chkd')

        } else {
            for (j = 0; j <= lnth; j++) {
                if ($(arr).eq(j).find('a').hasClass('chkd'))
                    $(arr).eq(j).click();
            }
            $(_this).children('a').removeClass('chkd')
        }

    })
};

DD.prototype.searchData = function(innerHTML, sTxtValue, id, key, bindTo) {
    var html = '',
        _this = this,
        innerHTML = innerHTML.toString();
    getPos = (innerHTML.toLowerCase()).indexOf(sTxtValue.toLowerCase()),
        strLower = innerHTML.toLowerCase(),
        sTxtValueLower = sTxtValue.toLowerCase(),
        spaceVal = ((strLower.indexOf(' ' + sTxtValueLower)) < 0) ? false : strLower.indexOf(' ' + sTxtValueLower),
        bracketVal = ((strLower.indexOf('(' + sTxtValueLower)) < 0) ? false : strLower.indexOf('(' + sTxtValueLower),
        slashVal = ((strLower.indexOf('/' + sTxtValueLower)) < 0) ? false : strLower.indexOf('/' + sTxtValueLower);
    if (getPos >= 0 && ((spaceVal || bracketVal || slashVal)) || getPos === 0) {
        if (getPos) {
            if (spaceVal) {
                getPos = spaceVal + 1;
            } else if (bracketVal) {
                getPos = bracketVal + 1;
            } else if (slashVal) {
                getPos = slashVal + 1;
            }
        }
        var new1 = innerHTML.substr(0, getPos),
            e = '<b>' + innerHTML.substr(getPos, sTxtValue.length) + '</b>',
            new2 = innerHTML.substr(getPos + sTxtValue.length, innerHTML.length),
            KY = _this.Escp(key).replace(_this.sortPrefix, '');
        if (_this.selChkBox(KY + '_' + bindTo, id)) {
            html = _this.createLi(KY, new1 + e + new2, bindTo, 'chkd');
        } else {
            html = _this.createLi(KY, new1 + e + new2, bindTo);
        }
    } //end of getPos if    
    return html;
};

DD.prototype.selChkBox = function(Lid, id) {
    var mtch = 0,
        X = this;
    for (var x in X.ChkBoxContr) {
        if (Lid == X.ChkBoxContr[x]) {
            mtch = 1;
        }
    }
    return mtch ? true : false;
};

DD.prototype.selCheckBox = function(id, KY, M, n) { // n is only avail in CASE of optGroup
    var flg = 0;
    for (var x in this.ChkBoxContr) {
        flg = 1;
        break;
    }
    if (flg) {
        if (n) {
            return this.selChkBox(id + '_' + n + '_' + KY + '_' + M, id) ? 'chkd' : '';
        } else {
            return this.selChkBox(id + '_' + KY + '_' + M, id) ? 'chkd' : '';
        }
    }
};

DD.prototype.createParLi = function(KY, key, id, chkd) { // code by Nitin 
    /*bnd = bnd?'bindTo="'+bnd+'"':'';*/
    chkd = chkd ? 'class="' + chkd + '"' : '';
    if (chkd) {
        return '<li class="optgroup" data-id=' + 'opt_' + KY + '><a href="javascript:;" data-id=' + id + '>' + key + '</li>'; // only if parentChkBox is true
    } else {
        return '<li class="optgroup" data-id=' + 'opt_' + KY + '>' + key + '</li>';
    }
};

DD.prototype.createLi = function(id, txt, bnd, chkd) {
    bnd = bnd ? 'bindTo="' + bnd + '"' : '';
    chkd = chkd ? 'class="' + chkd + '"' : '';
    return '<li class="pickVal" ' + bnd + '><a href="javascript:;" ' + chkd + ' data-id=' + id + '>' + this.replaceTag(txt) + '</a></li>';
};

DD.prototype.resetInpWidth = function(id) {
    $('#clrAll_' + id).hide();
    this.inpElm.css({
        'width': ''
    });
    $('#' + id).find('li.frst').css({
        'float': 'none'
    });
};

DD.prototype.firstHighlight = function() {
    var X = this;
    var finalId;
    var id = X.id;
    var ulCont_parent = $('#ul_' + id);
    var ulCont = ulCont_parent.find('ul');
    if (X.curActElm) X.curActElm.removeClass('active');
    X.curActElm = ulCont.find('li:first-child');
    var hidVal = X.Escp(X.inpHid.attr('value'));
    if (hidVal && !X.chkBox) {
        X.curActElm.removeClass('active');
        if (X.inpHid.data('optGroupKey')) {
            finalId = id + '_' + hidVal + '_' + X.inpHid.data('optGroupKey');
        } else {
            finalId = id + '_' + hidVal;
        }
        X.curActElm = ulCont.find('[data-id="' + finalId + '"]').parent().addClass('active');
    } else {
        X.curActElm.addClass('active');
    }
};

DD.prototype.emptyHidField = function(key, id, txt) { //checked
    var X = this;
    txt ? txt.toLowerCase() == "all" ? X.Allflg = '' : '' : '';
    var cKey = X.dUnderScore(X.uEscp(key)).replace(X.sortPrefix, '');
    var index = $.inArray(cKey, X.hidValue),
        finalVal;
    if (index !== -1) {
        X.hidValue.splice(index, 1);
        finalVal = JSON.stringify(X.hidValue);
    }
    if (X.hidValue.length == 0) {
        X.resetInpWidth(id);
        finalVal = X.hidValue;
    }
    X.inpHid.val(finalVal);
    X.onChange(X.hidValue);
};

DD.prototype.setInputText = function() {
    var X = this;
    var midVal;
    var id = X.id;

    if (X.Allflg == "all") {
        midVal = "all";
    } else {
        midVal = X.TagCnt;
    }
    if (X.TagCnt) {
        X.TagSpCnt || X.tags === false ? X.inpElm.val(X.preTxt + ' ' + midVal + ' ' + X.postTxt) : '';
    } else if (!X.inpHid.val() && X.inputValReset) {
        $('#' + id).find('.cross').hide();
        X.inpElm.val('');
        X.inpElm.css({
            width: ''
        });
    }
};

DD.prototype.setPlaceHolderAttribute = function() {
    var X = this;
    X.inpElm.attr('placeholder', X.inpElm.data('placeholder'));
    X.inpElm.parents('.frst').css({
        'float-left': 'none'
    });
};

DD.prototype.removeData = function(obj) {
    var X = this,
        id = X.id,
        cntr = 0;
    X.dpLyr.find('ul li').each(function() {
        if ($(this).attr('bindTo') == obj.key) {
            var anch = $(this).children('a');
            if (anch.length) {
                var id = anch.data('id');
                if (anch.hasClass('chkd')) {
                    delete X.ChkBoxContr[X.uEscp(id.split('_')[1])];
                    X.removeTag('tg_' + id + '_' + X.Escp(obj.key), anch.html(), true);
                }
            }
            cntr++;
            $(this).remove();
        }
    });
    delete X.Ary[obj.key];
    X.liCntr = X.liCntr - cntr;

    //Hack for Cja bug --- should be remove when the issue will fixed
    if (!$('#ul_' + X.id).find('li').length) {
        $('#' + X.id).find('.tagit').remove();
    }
};

DD.prototype.removeBlockofData = function(obj) {
    this.removeData(obj);
};

DD.prototype.addSelected = function(obj, tag_onof_flag) { // depricated removed in v10.0.0
    var id = this.id;
    for (var x in obj) {
        this.CreateTags(obj[x], id + '_' + x + '_A', 0, tag_onof_flag);
    }
};

DD.prototype.deleteSelected = function(obj) { // depricated removed in v10.0.0
    var id = this.id;
    for (var x in obj.keyObject) {
        this.removeTag('tg_' + id + '_' + obj.keyObject[x] + '_' + 'A', '', obj.tag_onof_flag, obj.remId);
    }
};

DD.prototype.select = function(obj) { // key accept after removing sortprefix
    var X = this;
    var id = X.id;
    if (X.chkBox) {
        for (var x in obj.key) {
            var key = obj.key[x];
            var sPkey = X.sortPrefix ? X.sortPrefix + key : key;
            var nodeData = X.optgrpNameRef[sPkey];
            if (nodeData.pName) {
                X.CreateTags(nodeData.text, id + '_' + key + '_' + nodeData.pName + '_A');
            } else {
                X.CreateTags(nodeData.text, id + '_' + key + '_A');
            }
        }
    } else {
        if (!X.optgrpNameRef[obj.key]) throw ('DD: Key not exist');
        X.SingleSelection(X.optgrpNameRef[obj.key].text, [id, obj.key]);
    }
};

DD.prototype.deselect = function(obj) {
    var X = this;
    var id = X.id;
    if (X.chkBox) {
        for (var x in obj.key) {
            var key = obj.key[x];
            var sPkey = X.sortPrefix ? X.sortPrefix + key : key;
            var nodeData = X.optgrpNameRef[sPkey];
            if (nodeData.pName) {
                X.removeTag('tg_' + id + '_' + obj.key[x] + '_' + nodeData.pName + '_' + 'A');
            } else {
                X.removeTag('tg_' + id + '_' + obj.key[x] + '_' + 'A');
            }
        }
    } else {
        if (!X.optgrpNameRef[obj.key]) throw ('DD: Key not exist');
        X.SingleSelection('', [id]);
    }
};

DD.prototype.addData = function(obj) { // to append data in dropdown
    var X = this;
    var data = {};
    var tempObj = [];

    if (!obj.status) { // for lagacy support
        obj.status = "Checked";
    }
    var addKey = obj['key'] ? obj['key'] : 'A';
    if (obj.status == "Checked") {
        data[addKey] = obj['data'];
        var njson = X.prefillDataFormation(obj.prefillData);
        tempObj[X.id] = njson;
        X.NLi = X.appendData(data, tempObj, njson);
        $('#ul_' + X.id).find('ul').append(X.NLi[0]);
        X.createTags_ifPrefillData(X.NLi[2]);
        X.liCntr += X.NLi[1];
    } else if (obj.status == "Unchecked") {
        this.removeBlockofData(obj);
    }
};

DD.prototype.createTags_ifPrefillData = function(obj) {
    var X = this;
    var id = X.id;
    if (X.chkBox && obj) { // create tag on prefill basis
        for (var k = 0; k < obj.length; k++) {
            for (var z in X.prefillData) {
                if (X.prefillData[z] == obj[k][3]) {
                    break;
                }
            }
            X.CreateTags(obj[k][0], obj[k][1], z, X.tags);
        }
    }
    X.setInputText();
};

DD.prototype.replaceData = function(params) {
    var X = this;
    id = X.id;
    var isReset = params.isReset === false ? params.isReset : X.isReset;
    var tempObj = [];
    var hidElm = X.inpHid;
    var hidVal = $.trim(hidElm.val());
    X.prefillData = params.prefillData;
    var prefillData;
    if (X.chkBox && hidVal) {
        if (X.TagSpCnt) {
            $('#' + X.TagSpCnt).find('.tagit').remove();
        } else {
            $('#' + id).find('.DDsearch').find('.tagit').remove();
        }
        X.resetInpWidth(id);
        X.ChkBoxContr = {};
        hidElm.val('');
        X.hidValue = []; // when click on clearon button then it should be removed
        X.TagCnt = 0;
        X.setPlaceHolderAttribute();
    }
    if (isReset) { // to enable/disabled reset filed 
        X.inpElm.val('');
        hidElm.val('');
    }

    if (!$.isEmptyObject(params.data)) {
        X.Ary = {
            'A': params.data
        };
        X.ChkBoxContr = [];
        var njson = X.prefillDataFormation(params.prefillData);
        tempObj[id] = njson;
        var html = X.appendData(X.Ary, tempObj, njson);
        X.dpLyr.find('ul').html(html[0]);
        X.createTags_ifPrefillData(html[2]);
        X.liCntr = html[1];
    } else {
        throw ('Either data object is empty or undefined');
    }
};

DD.prototype.hideDD = function() {
    var X = this,
        id = X.id;
    if (X.dpLyr.css('display') == "block") {
        X.dpLyr.hide();
        $('#' + id).find('.DDwrap').removeClass('brBotN');
        if (!X.chkBox) {
            X.curActElm ? X.curActElm.removeClass('active') : '';
            if (!X.inpHid.val() && X.inputValReset) {
                X.inpElm.val('');
            }
        }
        X.setInputText();
    }

    if (X.srchBx !== false) {
        X.setLi(id);
    }
};

DD.Ary = {};
DD.lastRef = {};


var ieObj = {
    scrollHandler: function(container, scrollContainer, firstElement, curActiveTouple) {
        if (curActiveTouple.length) {
            var scrollTopPos;

            var scrollCont_maxHeight = scrollContainer.height();
            var scrollCont_scrollTop = scrollContainer.scrollTop();
            var visible_bottom = scrollCont_maxHeight + scrollCont_scrollTop;
            var high_top = (curActiveTouple.position().top + scrollContainer.scrollTop());
            var high_bottom = high_top + curActiveTouple.outerHeight();

            if (high_bottom >= visible_bottom) {
                scrollTopPos = (high_bottom - scrollCont_maxHeight) > 0 ? high_bottom - scrollCont_maxHeight : 0;
                scrollContainer.scrollTop(scrollTopPos);
            } else if (high_top < scrollContainer.scrollTop()) {
                scrollTopPos = high_top;
                scrollContainer.scrollTop(scrollTopPos);
            }
            return scrollTopPos;
        }
    }
};

//end of custom dropdown//
