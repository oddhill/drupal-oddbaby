import './page-footer.scss';

export function renderPageFooter(): string {
  return /* html */ `
    <footer class="page-footer">
      <div class="page-footer__content">
        <div class="page-footer__about">
          <div class="page-footer__title">
            SUP for Life Lomma
          </div>

          <div class="page-footer__text">
            SUP for Life är en ideell förening i Lomma kommun för ungdomar och vuxna. Vi startade Oktober 2020. Vi hyr ut brädor, anordnar träningar och tävlingar. Alla är välkomna.
          </div>
        </div>

        <div class="page-footer__contact">
          <div class="page-footer__title">
            Kontakta oss
          </div>

          <div class="page-footer__text">
            Trollsjövägen 84<br>
            23733 Bjärred<br>
            <a class="page-footer__link" href="tel:0760-440072">0760-440072</a><br>
            <a class="page-footer__link" href="mailto:supforlifelomma@gmail.com">supforlifelomma@gmail.com</a>
          </div>
        </div>

        <div class="page-footer__social">
          <div class="page-footer__title">
            Följ oss
          </div>

          <div class="page-footer__text">
            <a href="#" arial-label="Facebook">
              <svg width="15" height="14" xmlns="http://www.w3.org/2000/svg">
                <path d="M1.773 0C1.077 0 .5.577.5 1.273v11.454C.5 13.423 1.077 14 1.773 14h11.454c.696 0 1.273-.577 1.273-1.273V1.273C14.5.577 13.923 0 13.227 0H1.773Zm0 1.273h11.454v11.454H9.926V8.432h1.65l.24-1.91h-1.89V5.29c0-.556.137-.934.935-.934h1.034v-1.73c-.177-.022-.788-.06-1.491-.06-1.467 0-2.466.883-2.466 2.526v1.432h-1.67v1.909h1.67v4.295H1.772V1.273Z" fill="#FFF" fill-rule="nonzero"/>
              </svg>
            </a>

            <a href="#" arial-label="Instagram">
              <svg width="15" height="14" xmlns="http://www.w3.org/2000/svg">
                <path d="M4.617 0A4.133 4.133 0 0 0 .5 4.117v5.766A4.133 4.133 0 0 0 4.617 14h5.766A4.133 4.133 0 0 0 14.5 9.883V4.117A4.133 4.133 0 0 0 10.383 0H4.617Zm0 1.273h5.766a2.84 2.84 0 0 1 2.844 2.844v5.766a2.84 2.84 0 0 1-2.844 2.844H4.617a2.84 2.84 0 0 1-2.844-2.844V4.117a2.84 2.84 0 0 1 2.844-2.844Zm6.641 1.392a.574.574 0 0 0-.576.577c0 .32.256.576.576.576a.574.574 0 0 0 .578-.576.574.574 0 0 0-.578-.577ZM7.5 3.182A3.83 3.83 0 0 0 3.682 7 3.83 3.83 0 0 0 7.5 10.818 3.83 3.83 0 0 0 11.318 7 3.83 3.83 0 0 0 7.5 3.182Zm0 1.273A2.534 2.534 0 0 1 10.045 7 2.534 2.534 0 0 1 7.5 9.545 2.534 2.534 0 0 1 4.955 7 2.534 2.534 0 0 1 7.5 4.455Z" fill="#FFF" fill-rule="nonzero"/>
              </svg>
            </a>
          </div>
        </div>

        <div class="page-footer__links">
          <a class="page-footer__link" href="#">Om Cookies</a>
          <a class="page-footer__link" href="#">Integritetspolicy</a>
        </div>
      </div>
    </footer>
  `;
}
