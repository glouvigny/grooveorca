// Stack management
var createOrGetStack = function(stack)
{
    var targetStack = $('#' + stack);
    if (!targetStack.length) {
        targetStack = $('<article>').addClass('hidden').attr('id', stack);
        $('.deck').append(targetStack);
    }

    return targetStack;
};

var currentStack = function()
{
   return $('.deck article:not(.hidden)');
};

var switchToStack = function(name)
{
    var stack = currentStack();
    var targetStack = createOrGetStack(name);

    if (stack.attr('id') != targetStack.attr('id')) {
        stack.find("section:gt(0)").remove();
        stack.addClass('hidden');
    }

    $('nav .nav-btn').removeClass('active');
    $('nav .nav-btn[data-switch-view=' + name + ']').addClass('active');

    targetStack.removeClass('hidden');

    return targetStack;
};

Messaging.addRecv(function (options) {
    if (!options || !options.output || !options.output.popup_tab) {
        return false;
    }

    var tab = options.output.popup_tab;
    $('nav [data-switch-view=' + tab.view + ']').remove();
    $('nav').append(
        $('<a>')
            .addClass('nav-btn')
            .attr({'title': tab.name, 'data-switch-view': tab.view})
            .append($('<i>').addClass(tab.icon))
    );

    var first_view = localStorage['popup-tab'];
    if (first_view === undefined) {
        first_view = 'artist_page';
    }

    if (first_view === tab.view) {
        switchToStack(tab.view);
    }
});

Messaging.addRecv(function (options) {
    if (!options || !options.stack || !options.output.view) {
        return false;
    }

    var mode = 'append';
    if (options.action == 'replace-first') {
        mode = 'html';
    }

    createOrGetStack(options.stack)[mode](
        $('<section>').html(options.output.view)
    );
});

Messaging.addRecv(function (options) {
    if (!options || !options.output || !options.output.fragment ||
        !options.output.fragment.name) {
        return false;
    }

    var fragment = options.output.fragment;
    var elts = $('[data-fragment=' + fragment.name + ']');

    if (fragment.text) {
        elts.text(fragment.text);
    }

    if (fragment.attributes) {
        for (var name in fragment.attributes) {
            elts.attr(name, fragment.attributes[name]);
        }
    }
});

$(document).on('click', 'nav a[data-switch-view]', function (evt) {
    var stack_name = $(this).data('switch-view');

    switchToStack(stack_name);
    localStorage['popup-tab'] = stack_name;
});


$(document).on('click', '*[data-page-navigation]', function (evt) {
    var options = {
        name: $(this).data('page-navigation'),
        stack: currentStack().attr('id'),
        action: 'push-to-stack',
    };

    $(this).each(function() {
        $.each(this.attributes, function() {
            if (this.specified && /^data-option-/.test(this.name)) {
                options[this.name.substring(12)] = this.value;
            }
        });
    });

    Messaging.send(options);
});

$(document).on('click', '*[data-action]', function (evt) {
    Messaging.send({name: $(this).data('action')});
});

$(document).on('click', '*[data-action="back"]', function () {
    var sections = currentStack().find('section');
    if (sections.size() > 1) {
        sections.last().remove();
    }
});

var obs = new MutationObserver(function(mutations) {
    mutations.forEach(function (mut) {
        var data;

        if (mut.attributeName === 'data-progress') {
            data = mut.target.getAttribute(mut.attributeName);

            $(mut.target).css({width: (data * 100) + '%'});
        } else if (mut.attributeName === 'data-time') {
            data = parseInt(mut.target.getAttribute(mut.attributeName), 10);

            if (isNaN(data)) {
                data = 0;
            }

            data = ('00' + parseInt(data / 60, 10)).substr(-2,2) + ':' +
                    ('00' + parseInt(data % 60, 10)).substr(-2,2);

            $(mut.target).text(data);
        }
    });
});

obs.observe(document.querySelector("header"), {attributes: true, subtree: true,
    childList: true});

$('.meter, .meter span').on('click', function (evt) {
    var x = evt.offsetX === undefined ? evt.originalEvent.layerX : evt.offsetX;
    var percent = x / $('.meter div').closest('.meter').width();
    var position = percent * $('[data-fragment=current-duration]').data('time');
    Messaging.send({
        name: 'controls_seek',
        data: {
            position: position,
        }
    });
});

$(document).on('change', '*[data-setting-name]', function () {
    var value = $(this).val();
    if ($(this).attr('type') === 'checkbox' && !$(this).is(':checked')) {
        value = '';
    }

    Messaging.send({
        name: 'settings_save',
        data: {
            param_ref: $(this).data('setting-name'),
            param_value: value,
        }
    });
});


Messaging.send({name: 'popup_page'});
