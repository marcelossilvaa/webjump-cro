(function () {
  let css = `<style>
@media screen and (min-width: 768px){
    .dp-CPD__caps-container  .AddToBagButtonLarge{
    width: auto !important;
    padding: 0.8rem 9px;
    }
    .dp-CPD__caps-container .AddToBagButtonLarge__label{
        font-size:18px;
    } 
}
 .dp-OAC-benefits__title, .dp-OAC-benefits__name{
    color:#000;
 }
 .dp-CPD__caps-container  .AddToBagButtonLarge__basketIcon{
    display:none !important;
 }
 .AddToBagButtonLarge__plusIcon{
    display:none !important;
 }
.dp-CPD__caps-container .AddToBagButtonLarge__label{
    font-weight:400;
    letter-spacing:.015625rem!important;
    font-family:"NespressoLucas",sans-serif;
}
.dp-CPD__caps-container .AddToBagButtonLarge{
    border-radius: 200px !important;
}
.dp-CPD__nav .dp-CPD__nav-item-button{
    font-family:"NespressoLucas",sans-serif;
    background-color: transparent !important;
    border:0px;
    border-bottom:1px solid #000;
}
</style>
`;
  document.head.insertAdjacentHTML("beforeend", css);
})();
