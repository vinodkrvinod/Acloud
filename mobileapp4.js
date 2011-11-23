/*
 * Copyright (c) 2011, salesforce.com, inc.
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without modification, are permitted provided
 * that the following conditions are met:
 *
 * Redistributions of source code must retain the above copyright notice, this list of conditions and the
 * following disclaimer.
 *
 * Redistributions in binary form must reproduce the above copyright notice, this list of conditions and
 * the following disclaimer in the documentation and/or other materials provided with the distribution.
 *
 * Neither the name of salesforce.com, inc. nor the names of its contributors may be used to endorse or
 * promote products derived from this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY EXPRESS OR IMPLIED
 * WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A
 * PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE LIABLE FOR
 * ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED
 * TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION)
 * HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
 * NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE
 * POSSIBILITY OF SUCH DAMAGE.
 */

/*
  * This is a simple jQuery Mobile-based app that uses the Force.com REST API.
  * See mobile.page for code required to run this in Visualforce
  * See mobile.html for code required to run this on your own server
  */

function errorCallback(jqXHR){
    alert(jqXHR.statusText + ": " + jqXHR.responseText);
}

function addClickListenersfeed() {
    $j('#newbtnfeed1').click(function(e) {
        // Show the 'New Account' form
        e.preventDefault();
        $j('#feedform')[0].reset();
        $j('#feedformheader').html('New Feed');
        setButtonTextcontact('#actionbtnfeed', 'Create');
        $j('#actionbtnfeed').unbind('click.btn').bind('click.btn', createHandlerfeed);
        $j.mobile.changePage('#editpagefeed', "slide", false, true);
    });

    $j('#deletebtnfeed').click(function(e) {
        // Delete the account
        e.preventDefault();
        $j.mobile.pageLoading();
        client.del('FeedItem', $j('#feeddetail').find('#feedId').val()
        ,
        function(response) {
            getFeed(function() {
                $j.mobile.pageLoading(true);
                $j.mobile.changePage('#mainpagefeed', "slide", true, true);
            });
        }, errorCallback);
    });

    $j('#newbtnfeed').click(function(e) {
        // Get account fields and show the 'Edit Account' form
        e.preventDefault();
        $j.mobile.pageLoading();
		$j('#feedform')[0].reset();
		client.query("SELECT Id,ParentId,Body FROM FeedItem",
        function(response) {
		$j.each(response.records,
        function() 
		{
             var idf = this.ParentId;        
		      $j('#ParentId').val(idf);
					$j.mobile.pageLoading(true);
                    $j.mobile.changePage('#editpagefeed', "slide", false, true);
                });}, errorCallback);
            $j('#feedformheader').html('New Feed');
            setButtonTextcontact('#actionbtnfeed', 'New Feed');
            $j('#actionbtnfeed').unbind('click.btn').bind('click.btn', createHandlerfeed);
            $j.mobile.pageLoading(true);
            $j.mobile.changePage('#mainpagefeed', "slide", false, true);
         });
	}
// Populate the account list and set up click handling  
function getFeed(callback) {
    $j('#feedlist').empty();
	client.query("SELECT Id,ParentId,Body FROM FeedItem"
    ,
    function(response) {
        $j.each(response.records,
        function() 
		{
            var idc = this.Id;
            $j('<li></li>')
            .hide()
            .append('<a href="#"><h2>' + this.Body + '</h2></a>')
            .click(function(e) {
                e.preventDefault();
                $j.mobile.pageLoading();
                // We could do this more efficiently by adding Industry and
                // TickerSymbol to the fields in the SELECT, but we want to
                // show dynamic use of the retrieve function...
                client.retrieve("FeedItem", idc, "Id,Body,ParentId"
                ,
                function(response) {
                    $j('#Body').html(response.Body);
					$j('#feedId').val(response.Id);
                    $j('#ParentfeedId').val(response.ParentId);
					$j.mobile.pageLoading(true);
                    $j.mobile.changePage('#detailpagefeed', "slide", false, true);
                }, errorCallback);
            })
            .appendTo('#feedlist')
            .show();
        });

        $j('#feedlist').listview('refresh');

        if (typeof callback != 'undefined' && callback != null) {
            callback();
        }
    }, errorCallback);
}

// Gather fields from the account form and create a record
function createHandlerfeed(e) {
    e.preventDefault();
    var feedform = $j('#feedform');
    var fieldsf = {};
    feedform.find('input').each(function() {
        var childq = $j(this);
        if (childq.val().length > 0 && childq.attr("name") != 'Id') {
            fieldsf[childq.attr("name")] = childq.val();
        }
    });
    $j.mobile.pageLoading();
	client.create('FeedItem', fieldsf,
    function(response) {
        getFeed(function() {
            $j.mobile.pageLoading(true);
            $j.mobile.changePage('#mainpagefeed', "slide", true, true);
        });
    }, errorCallback);
	
}
// Gather fields from the account form and update a record
function updateHandlerfeed(e) {
    e.preventDefault();
    var feedform = $j('#feedform');
    var field = {};
    feedform.find('input').each(function() {
        var childc = $j(this);
        if (childc.val().length > 0 && childc.attr("name") != 'Id') {
            field[childc.attr("name")] = childc.val();
        }
    });
    $j.mobile.pageLoading();
    client.update('FeedItem',feedform.find('#fId').val(), field
    ,
    function(response) {
        getFeed(function() {
            $j.mobile.pageLoading(true);
            $j.mobile.changePage('#mainpagefeed', "slide", true, true);
        });
    }, errorCallback);
}

// Ugh - this is required to change text on a jQuery Mobile button
// due to the way it futzes with things at runtime
function setButtonTextcontact(id, str) {
    $j(id).html(str).parent().find('.ui-btn-text').text(str);
}
