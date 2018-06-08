(function($) {
  "use strict";

  /**
   * 修正原有实现传入null时会出错问题
   */
  $.extend($.fn.datetimepicker.Constructor.prototype, {

    getDate : function() {
      var d = this.getUTCDate();
      return d == null ? null : new Date(d.getTime() + (d.getTimezoneOffset() * 60000));
    },

    setDate : function(d) {
      if (d == null) {
        this._setDate(null, 'date');
      } else {
        this.setUTCDate(new Date(d.getTime() - (d.getTimezoneOffset() * 60000)));
      }
    }
  });

  /**
   * 修正原有实现无法正确处理日期格式中的中文导致值出现1899年问题
   */
  function UTCDate() {
    return new Date(Date.UTC.apply(Date, arguments));
  }
  
  $.extend($.fn.datetimepicker.DPGlobal, {
    parseDate : function(date, format, language, type) {
      if (date instanceof Date) {
        var dateUTC = new Date(date.valueOf() - date.getTimezoneOffset() * 60000);
        dateUTC.setMilliseconds(0);
        return dateUTC;
      }
      // TODO 先对数据进行猜测是否合适？
      if (/^[-+]\d+[dmwy]([\s,]+[-+]\d+[dmwy])*$/.test(date)) {
        var part_re = /([-+]\d+)([dmwy])/, parts = date.match(/([-+]\d+)([dmwy])/g), part, dir;
        date = new Date();
        for (var i = 0; i < parts.length; i++) {
          part = part_re.exec(parts[i]);
          dir = parseInt(part[1]);
          switch (part[2]) {
          case 'd':
            date.setUTCDate(date.getUTCDate() + dir);
            break;
          case 'm':
            date = Datetimepicker.prototype.moveMonth.call(Datetimepicker.prototype, date, dir);
            break;
          case 'w':
            date.setUTCDate(date.getUTCDate() + dir * 7);
            break;
          case 'y':
            date = Datetimepicker.prototype.moveYear.call(Datetimepicker.prototype, date, dir);
            break;
          }
        }
        return UTCDate(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), date.getUTCHours(), date.getUTCMinutes(), date
            .getUTCSeconds(), 0);
      }
      if (!format) {
        // 未指定格式，通过数据进行猜测
        if (/^\d{4}\-\d{1,2}\-\d{1,2}$/.test(date)) {
          format = this.parseFormat('yyyy-mm-dd', type);
        }
        if (/^\d{4}\-\d{1,2}\-\d{1,2}[T ]\d{1,2}\:\d{1,2}$/.test(date)) {
          format = this.parseFormat('yyyy-mm-dd hh:ii', type);
        }
        if (/^\d{4}\-\d{1,2}\-\d{1,2}[T ]\d{1,2}\:\d{1,2}\:\d{1,2}[Z]{0,1}$/.test(date)) {
          format = this.parseFormat('yyyy-mm-dd hh:ii:ss', type);
        }
      }

      var separators = format.separators;
      // 正则表达式中需要编码的数据
      var e = /[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g;
      var re = '';
      var included = {};
      var c = 0;
      for(var i = 0; i < separators.length; i++) {
        var sep = separators[i];
        if(sep == '') {
          continue;
        }
        if(included[sep]) {
          continue;
        }
        included[sep] = true;
        if(c > 0) {
          re += '|';
        }
        re += sep.replace(e, '\\$&');
        c++;
      }
      var parts = date && date.split(new RegExp(re, 'g')) || [];
      var date = new Date(0, 0, 0, 0, 0, 0, 0), parsed = {};
      var setters_order = [ 'hh', 'h', 'ii', 'i', 'ss', 's', 'yyyy', 'yy', 'M', 'MM', 'm', 'mm', 'D', 'DD', 'd', 'dd', 'H', 'HH',
          'p', 'P' ];
      var setters_map = {
        hh : function(d, v) {
          return d.setUTCHours(v);
        },
        h : function(d, v) {
          return d.setUTCHours(v);
        },
        HH : function(d, v) {
          return d.setUTCHours(v == 12 ? 0 : v);
        },
        H : function(d, v) {
          return d.setUTCHours(v == 12 ? 0 : v);
        },
        ii : function(d, v) {
          return d.setUTCMinutes(v);
        },
        i : function(d, v) {
          return d.setUTCMinutes(v);
        },
        ss : function(d, v) {
          return d.setUTCSeconds(v);
        },
        s : function(d, v) {
          return d.setUTCSeconds(v);
        },
        yyyy : function(d, v) {
          return d.setUTCFullYear(v);
        },
        yy : function(d, v) {
          return d.setUTCFullYear(2000 + v);
        },
        m : function(d, v) {
          v -= 1;
          while (v < 0)
            v += 12;
          v %= 12;
          d.setUTCMonth(v);
          while (d.getUTCMonth() != v)
            d.setUTCDate(d.getUTCDate() - 1);
          return d;
        },
        d : function(d, v) {
          return d.setUTCDate(v);
        },
        p : function(d, v) {
          return d.setUTCHours(v == 1 ? d.getUTCHours() + 12 : d.getUTCHours());
        }
      }, val, filtered, part;
      setters_map['M'] = setters_map['MM'] = setters_map['mm'] = setters_map['m'];
      setters_map['dd'] = setters_map['d'];
      setters_map['P'] = setters_map['p'];
      date = UTCDate(date.getFullYear(), date.getMonth(), date.getDate(), date.getHours(), date.getMinutes(), date.getSeconds());
      if (parts.length == format.parts.length) {
        for (var i = 0, cnt = format.parts.length; i < cnt; i++) {
          val = parseInt(parts[i], 10);
          part = format.parts[i];
          if (isNaN(val)) {
            switch (part) {
            case 'MM':
              filtered = $(dates[language].months).filter(function() {
                var m = this.slice(0, parts[i].length), p = parts[i].slice(0, m.length);
                return m == p;
              });
              val = $.inArray(filtered[0], dates[language].months) + 1;
              break;
            case 'M':
              filtered = $(dates[language].monthsShort).filter(function() {
                var m = this.slice(0, parts[i].length), p = parts[i].slice(0, m.length);
                return m == p;
              });
              val = $.inArray(filtered[0], dates[language].monthsShort) + 1;
              break;
            case 'p':
            case 'P':
              val = $.inArray(parts[i].toLowerCase(), dates[language].meridiem);
              break;
            }
          }
          parsed[part] = val;
        }
        for (var i = 0, s; i < setters_order.length; i++) {
          s = setters_order[i];
          if (s in parsed && !isNaN(parsed[s]))
            setters_map[s](date, parsed[s])
        }
      }
      return date;
    }
  });
})(jQuery);