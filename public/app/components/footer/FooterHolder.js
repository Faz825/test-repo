import React from 'react'
import Session  from '../../middleware/Session';
import SecretaryThumbnail from '../elements/SecretaryThumbnail'

const FooterHolder = (props) => {
  let _sesData = Session.getSession('prg_lg');

  let _secretary_image = _sesData.secretary_image_url;

  return(
    <div className="row row-clr pg-footer-wrapper">
        <div className="pg-footer-left-options-panel">
            <SecretaryThumbnail url={_secretary_image} />
            <div className="pg-footer-left-options">
                <a href="#"><img src="images/pg-home-v6_03.png" alt="" className="img-responsive"/></a>
                <a href="#"><img src="images/pg-home-v6_066.png" alt="" className="img-responsive"/></a>
                <a href="#"><img src="images/pg-home-v6_08.png" alt="" className="img-responsive"/></a>
            </div>
        </div>

        <div className="container">
            <div className="pg-footer-top-control-panel">
                <a href="#"><img src="images/footer-control-ico-1.png" alt="" className="img-responsive"/> split</a>
                <a href="#"><img src="images/footer-control-ico-2.png" alt="" className="img-responsive"/> full</a>
            </div>
        </div>

        <div className="pg-footer-right-options-panel">
            <div className="pg-footer-right-options-panel-inner">
                <a href="workmode.html">
                    <img src="images/footer-right-image.png" alt="Logo" className="img-responsive" />
                    <p>Work Mode</p>
                </a>
            </div>
        </div>

    </div>
  );
}

export default FooterHolder;
