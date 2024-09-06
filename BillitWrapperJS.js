// Billit class
class Billit {
    constructor(context = "1234567890") { // context is the relevant CompanyID, in case the user can manage multiple companies. If left as an empty string, it will default to the first company the user has access to
      this.context = context
      
      
      this.setDefaults = function(context) {      
        this.baseUrl = "https://api.billit.be/v1/"
        this.params = {
          "contentType": "application/json",
          "headers": {
            apiKey: "XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX", // Billit API key
            partyID: context
          },
          "muteHttpExceptions": true
        }
  
        this.setContext(this.context)
      }
  
  
      this.getContext = function() {
        return this.params.headers.partyID
      }
  
  
      this.setContext = function(context) {
        this.params.headers.partyID = context.toString()
  
        return this
      }
  
      
      this.setDefaults(this.context)
  
      
      this.setDefaultBody = function(body, endpoint) {
        switch (endpoint) {
          case "parties/":
            return Object.assign({
              PartyType: "Customer",
              VATLiable: false,
              VentilationCode: "1",
              DefaultPaymentMethodTC: "Online",
              CustomerType: "Private",
              DefaultPaid: false
            }, body)
            break;
          case "orders/":
            let now = new Date()
            let curDate = new Date(now.toString())
            let expDate = new Date(now.toString())
            expDate.setDate(expDate.getDate() + 10)
            return Object.assign({
              SupplierID: context,
              OrderType: "Invoice",
              OrderDirection: "Income",
              OrderDate: curDate,
              ExpiryDate: expDate,
              VentilationCode: "1"
            }, body)
            break;
          default:
            return body
        }
      }
  
      
      this.getResult = function(endpoint) {
        return UrlFetchApp.fetch(this.baseUrl + endpoint, this.params)
      }
  
      
      this.postPatch = function(endpoint, id = "") {
        var result = this.getResult(endpoint + id)
        console.log(result)
        if (result.getResponseCode() !== 200) {
          console.log("Something went wrong:")
          console.log(result.getContentText())
          return false
        } else {
          return parseInt(result.getContentText())
        }
      }
      
  
      this.createNew = function(body, endpoint) {
        var bodyWithDefaults = this.setDefaultBody(body, endpoint)
        this.params.method = "post"
        this.params.payload = JSON.stringify(bodyWithDefaults)
        var result = this.postPatch(endpoint)
        this.setDefaults()
        return result
      }
  
      
      this.patch = function(id, body, endpoint) {
        this.params.method = "patch"
        this.params.payload = JSON.stringify(body)
        var result = this.postPatch(endpoint, id)
        this.setDefaults()
        return result
      }
  
      
      this.remove = function(id, endpoint) {
        this.params.method = "delete"
        var result = this.postPatch(endpoint, id)
        this.setDefaults()
        return result
      }
  
      
      this.createOrder = function(body) {
        return JSON.parse(this.createNew(body, "orders/"))
      }
  
      
      this.createParty = function(body) {
        return JSON.parse(this.createNew(body, "parties/"))
      }
      
  
      this.patchOrder = function(id, body) {
        return JSON.parse(this.patch(id, body, "orders/"))
      }
      
  
      this.patchParty = function(id, body) {
        return JSON.parse(this.patch(id, body, "parties/"))
      }
      
  
      this.getOrder = function(id = "") {
        return JSON.parse(this.getResult("orders/" + id).getContentText())
      }
  
      
      this.getParty = function(id = "") {
        return JSON.parse(this.getResult("parties/" + id).getContentText())
      }
  
      
      this.getParties = function(query) {
        return JSON.parse(this.getResult("parties?" + query).getContentText())
      }
  
      
      this.getOrdersFromQuery = function(query) {
        return JSON.parse(this.getResult("orders" + query).getContentText())
      }
    }
  }
