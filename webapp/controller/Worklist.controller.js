sap.ui.define(
  [
    "./BaseController",
    "sap/ui/model/json/JSONModel",
    "../model/formatter",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/m/MessageBox",
  ],
  function (
    BaseController,
    JSONModel,
    formatter,
    Filter,
    FilterOperator,
    MessageBox
  ) {
    "use strict";

    return BaseController.extend(
      "preco.caixa.sol.preco01.controller.Worklist",
      {
        formatter: formatter,

        /* =========================================================== */
        /* lifecycle methods                                           */
        /* =========================================================== */

        /**
         * Called when the worklist controller is instantiated.
         * @public
         */
        onInit: function () {
          var oViewModel;

          // keeps the search state
          this._aTableSearchState = [];

          // Model used to manipulate control states
          oViewModel = new JSONModel({
            worklistTableTitle:
              this.getResourceBundle().getText("worklistTableTitle"),
            shareSendEmailSubject: this.getResourceBundle().getText(
              "shareSendEmailWorklistSubject"
            ),
            shareSendEmailMessage: this.getResourceBundle().getText(
              "shareSendEmailWorklistMessage",
              [location.href]
            ),
            tableNoDataText:
              this.getResourceBundle().getText("tableNoDataText"),
          });
          this.setModel(oViewModel, "worklistView");
        },

        onBeforeRendering: function () {},

        /* =========================================================== */
        /* event handlers                                              */
        /* =========================================================== */

        /**
         * Triggered by the table's 'updateFinished' event: after new table
         * data is available, this handler method updates the table counter.
         * This should only happen if the update was successful, which is
         * why this handler is attached to 'updateFinished' and not to the
         * table's list binding's 'dataReceived' method.
         * @param {sap.ui.base.Event} oEvent the update finished event
         * @public
         */
        onUpdateFinished: function (oEvent) {
          // update the worklist's object counter after the table update
          var sTitle,
            oTable = oEvent.getSource(),
            iTotalItems = oEvent.getParameter("total");
          // only update the counter if the length is final and
          // the table is not empty
          if (iTotalItems && oTable.getBinding("items").isLengthFinal()) {
            sTitle = this.getResourceBundle().getText(
              "worklistTableTitleCount",
              [iTotalItems]
            );
          } else {
            sTitle = this.getResourceBundle().getText("worklistTableTitle");
          }
          this.getModel("worklistView").setProperty(
            "/worklistTableTitle",
            sTitle
          );

          var aItems = oTable.getItems();

          var oItem = oTable.getBinding("items").aKeys;

          for (let index = 0; index < oItem.length; index++) {
            const element = oItem[index];
               this.BuscaPrecoNovo(element);
            // this.BuscaPrecoNovo(oItem[index]);
          }
        },

        BuscaPrecoNovo: function (sParam) {
          var oValue = this.getModel().getProperty( "/" + sParam + "/CodMatAntigo" );
          var oRequest = this.ajaxRequest(oValue);

          //Tratar o callback, sucesso / erro
          oRequest.then( function (data, textStatus, jqXHR) {
              debugger

              var UnitPrice =  data[0].value;
              this.getModel().setProperty( "/" + sParam + "/PrecoNovo",  UnitPrice );
              console.log(UnitPrice);

            }.bind(this),
            // Tratar erro
            function (jqXHR, textStatus, errorThrown) {
              MessageBox.warning("Erro ao carregar pre??o novo");
            }.bind(this) );
        },

        /**
         * Event handler when a table item gets pressed
         * @param {sap.ui.base.Event} oEvent the table selectionChange event
         * @public
         */
        onPress: function (oEvent) {
          // The source is the list item that got pressed
          this._showObject(oEvent.getSource());
        },

        ajaxRequest: function (sParam) {
          var uri = "https://cors-anywhere.herokuapp.com/https://services.odata.org/V2/Northwind/Northwind.svc/Products(" + sParam + ")";
          return new Promise((resolve, reject) => {

            $.ajax({
              type: "GET",
              url: uri,
              // async: true,
              crossDomain: true,
              dataType: "json",
              contentType:"application/json",
              
              Headers:{
                contentType: "application/atom+xml;charset=utf-8",
              },

              success: (...args) => resolve(args),
              error: (...args) => reject(args),
            });
          });
        },
        /**
         * Event handler for navigating back.
         * Navigate back in the browser history
         * @public
         */
        onNavBack: function () {
          // eslint-disable-next-line sap-no-history-manipulation
          history.go(-1);
        },

        onSearch: function (oEvent) {
          if (oEvent.getParameters().refreshButtonPressed) {
            // Search field's 'refresh' button has been pressed.
            // This is visible if you select any main list item.
            // In this case no new search is triggered, we only
            // refresh the list binding.
            this.onRefresh();
          } else {
            var aTableSearchState = [];
            var sQuery = oEvent.getParameter("query");

            if (sQuery && sQuery.length > 0) {
              aTableSearchState = [
                new Filter("Codmaterial", FilterOperator.Contains, sQuery),
              ];
            }
            this._applySearch(aTableSearchState);
          }
        },

        /**
         * Event handler for refresh event. Keeps filter, sort
         * and group settings and refreshes the list binding.
         * @public
         */
        onRefresh: function () {
          var oTable = this.byId("table");
          oTable.getBinding("items").refresh();
        },

        /* =========================================================== */
        /* internal methods                                            */
        /* =========================================================== */

        /**
         * Shows the selected item on the object page
         * @param {sap.m.ObjectListItem} oItem selected Item
         * @private
         */
        _showObject: function (oItem) {
          this.getRouter().navTo("object", {
            objectId: oItem
              .getBindingContext()
              .getPath()
              .substring("/zpreco_caixaSet".length),
          });
        },

        /**
         * Internal helper method to apply both filter and search state together on the list binding
         * @param {sap.ui.model.Filter[]} aTableSearchState An array of filters for the search
         * @private
         */
        _applySearch: function (aTableSearchState) {
          var oTable = this.byId("table"),
            oViewModel = this.getModel("worklistView");
          oTable.getBinding("items").filter(aTableSearchState, "Application");
          // changes the noDataText of the list in case there are no filter results
          if (aTableSearchState.length !== 0) {
            oViewModel.setProperty(
              "/tableNoDataText",
              this.getResourceBundle().getText("worklistNoDataWithSearchText")
            );
          }
        },
      }
    );
  }
);
