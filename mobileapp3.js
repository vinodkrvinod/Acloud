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

function addClickListenersquote() {
    $j('#newbtnquote').click(function(e) {
        // Show the 'New Account' form
        e.preventDefault();
        $j('#quoteform')[0].reset();
        $j('#quoteformheader').html('New quote');
        setButtonTextcontact('#actionbtnquote', 'Create');
        $j('#actionbtnquote').unbind('click.btn').bind('click.btn', createHandlerquote);
        $j.mobile.changePage('#editpagequote', "slide", false, true);
    });

    $j('#deletebtnquote').click(function(e) {
        // Delete the account
        e.preventDefault();
        $j.mobile.pageLoading();
        client.del('invoiceit_s__Quote__c', $j('#quotedetail').find('#quoteId').val()
        ,
        function(response) {
            getQuotes(function() {
                $j.mobile.pageLoading(true);
                $j.mobile.changePage('#mainpagequote', "slide", true, true);
            });
        }, errorCallback);
    });

    $j('#editbtnquote').click(function(e) {
        // Get account fields and show the 'Edit Account' form
        e.preventDefault();
        $j.mobile.pageLoading();
        client.retrieve("invoiceit_s__Quote__c", $j('#quotedetail').find('#quoteId').val()
        , "Name,Id,invoiceit_s__Status__c,invoiceit_s__Total__c",
        function(response) {
            $j('#quoteform').find('input').each(function() {
                $j(this).val(response[$j(this).attr("name")]);
            });
            $j('#quoteformheader').html('Edit Contact');
            setButtonTextcontact('#actionbtnquote', 'Update Quote');
            $j('#actionbtnquote')
            .unbind('click.btn')
            .bind('click.btn', updateHandlerquote);
            $j.mobile.pageLoading(true);
            $j.mobile.changePage('#editpagequote', "slide", false, true);
        }, errorCallback);
    });
}

// Populate the account list and set up click handling
function getQuotes(callback) {
    $j('#quotelist').empty();
	client.query("SELECT Id, Name FROM invoiceit_s__Quote__c ORDER BY Name LIMIT 20"
    ,
    function(response) {
        $j.each(response.records,
        function() {
            var idc = this.Id;
            $j('<li></li>')
            .hide()
            .append('<a href="#"><h2>' + this.Name + '</h2></a>')
            .click(function(e) {
                e.preventDefault();
                $j.mobile.pageLoading();
                // We could do this more efficiently by adding Industry and
                // TickerSymbol to the fields in the SELECT, but we want to
                // show dynamic use of the retrieve function...
                client.retrieve("invoiceit_s__Quote__c", idc, "Name,Id,invoiceit_s__Status__c,invoiceit_s__Total__c"
                ,
                function(response) {
                    $j('#qName').html(response.Name);
					$j('#invoiceit_s__Status__c').html(response.invoiceit_s__Status__c);
                    $j('#invoiceit_s__Total__c').html(response.invoiceit_s__Total__c);
                    $j('#quoteId').val(response.Id);
                    $j.mobile.pageLoading(true);
                    $j.mobile.changePage('#detailpagequote', "slide", false, true);
                }, errorCallback);
            })
            .appendTo('#quotelist')
            .show();
        });

        $j('#quotelist').listview('refresh');

        if (typeof callback != 'undefined' && callback != null) {
            callback();
        }
    }, errorCallback);
}

// Gather fields from the account form and create a record
function createHandlerquote(e) {
    e.preventDefault();
    var quoteform = $j('#quoteform');
    var fieldsq = {};
    quoteform.find('input').each(function() {
        var childq = $j(this);
        if (childq.val().length > 0 && childq.attr("name") != 'Id') {
            fieldsq[childq.attr("name")] = childq.val();
        }
    });
    $j.mobile.pageLoading();
	client.create('invoiceit_s__Quote__c', fieldsq,
    function(response) {
        getQuotes(function() {
            $j.mobile.pageLoading(true);
            $j.mobile.changePage('#mainpagequote', "slide", true, true);
        });
    }, errorCallback);
	
}

// Gather fields from the account form and update a record
function updateHandlerquote(e) {
    e.preventDefault();
    var quoteform = $j('#quoteform');
    var field = {};
    quoteform.find('input').each(function() {
        var childc = $j(this);
        if (childc.val().length > 0 && childc.attr("name") != 'Id') {
            field[childc.attr("name")] = childc.val();
        }
    });
    $j.mobile.pageLoading();
    client.update('invoiceit_s__Quote__c',quoteform.find('#qId').val(), field
    ,
    function(response) {
        getQuotes(function() {
            $j.mobile.pageLoading(true);
            $j.mobile.changePage('#mainpagequote', "slide", true, true);
        });
    }, errorCallback);
}

// Ugh - this is required to change text on a jQuery Mobile button
// due to the way it futzes with things at runtime
function setButtonTextcontact(id, str) {
    $j(id).html(str).parent().find('.ui-btn-text').text(str);
}
