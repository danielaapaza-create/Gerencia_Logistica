const LOGIXSC_PDFS={
 sf:'assets/docs/red-logistica-san-fernando.pdf',
 ch:'assets/docs/red-logistica-chimu.pdf'
};
function openPDF(which){
  const modal=document.getElementById('pdfViewerModal');
  const frame=document.getElementById('pdfFrame');
  frame.src=LOGIXSC_PDFS[which];
  modal.classList.add('show');
  document.body.style.overflow='hidden';
}
function closePDF(){
  const modal=document.getElementById('pdfViewerModal');
  const frame=document.getElementById('pdfFrame');
  modal.classList.remove('show'); frame.src='about:blank'; document.body.style.overflow='';
}
