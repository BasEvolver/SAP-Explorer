@AbapCatalog.sqlViewName: 'ZVVATREGISTER'
@AbapCatalog.compiler.compareFilter: true
@AccessControl.authorizationCheck: #NOT_REQUIRED
@EndUserText.label: 'VAT and Sales Tax Register'
@OData.publish: true

define view Z_VatRegister 
  as select from bkpf as Header
  
  // 1. Join Tax Document Data (BSET stores the summarized tax per document)
  join bset as TaxItem 
    on Header.bukrs = TaxItem.bukrs
   and Header.belnr = TaxItem.belnr
   and Header.gjahr = TaxItem.gjahr
   
  // 2. Join Company Text
  left outer join t001 as CompanyText
    on Header.bukrs = CompanyText.bukrs
    
  // 3. Join Tax Code Descriptions (Translates codes like 'V1' into 'Input VAT 19%')
  left outer join t007s as TaxText
    on TaxItem.mwskz = TaxText.mwskz
   and TaxText.spras = $session.system_language

{
    // --- Document Identifiers ---
    key TaxItem.bukrs as CompanyCode,
    key TaxItem.belnr as AccountingDocument,
    key TaxItem.gjahr as FiscalYear,
    key TaxItem.buzei as TaxItemNumber,
    
    // --- Company Data ---
    CompanyText.butxt as CompanyName,
    
    // --- Date & Type Data ---
    @Semantics.businessDate.at: true
    Header.budat as PostingDate,
    
    @Semantics.businessDate.at: true
    Header.bldat as DocumentDate,
    Header.blart as DocumentType,
    
    // --- Tax Details ---
    TaxItem.mwskz as TaxCode,
    TaxText.text1 as TaxCodeDescription,
    TaxItem.ktosl as TransactionKey,
    
    // --- Financial Amounts ---
    @Semantics.currencyCode: true
    Header.waers as TransactionCurrency,
    
    @Semantics.amount.currencyCode: 'TransactionCurrency'
    TaxItem.fwste as TaxAmount,
    
    @Semantics.amount.currencyCode: 'TransactionCurrency'
    TaxItem.fwbas as TaxBaseAmount
}
