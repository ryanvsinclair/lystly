export function StudioMarkup() {
  return (
    <div className="app">
      <aside className="panel">
        <header className="panel-head">
          <h1>Listing Studio</h1>
          <p className="lede">
            Pick a pose, drop in the property photo, then click any text on the preview to edit it.
          </p>
        </header>

        <div className="download-stack">
          <div className="download-tile">
            <button className="download-btn" id="downloadBtn" type="button" aria-label="Download PNG" aria-describedby="downloadTipPng">
              <span className="download-glyph is-main" data-icon="image" aria-hidden="true"></span>
              <span className="download-glyph is-check" data-icon="check" aria-hidden="true"></span>
            </button>
            <button className="download-info" type="button" aria-label="About Download PNG" tabIndex={-1}>
              i
            </button>
            <div className="download-tip" id="downloadTipPng" role="tooltip">
              <strong>Download PNG</strong>
              <p>4000 × 4000 Instagram square</p>
            </div>
          </div>
          <div className="download-tile">
            <button className="download-btn" id="brochureBtn" type="button" aria-label="Download PDF brochure" aria-describedby="downloadTipPdf">
              <span className="download-glyph is-main" data-icon="doc" aria-hidden="true"></span>
              <span className="download-glyph is-check" data-icon="check" aria-hidden="true"></span>
            </button>
            <button className="download-info" type="button" aria-label="About Download PDF brochure" tabIndex={-1}>
              i
            </button>
            <div className="download-tip" id="downloadTipPdf" role="tooltip">
              <strong>Download PDF brochure</strong>
              <p>Cover, photos, and listing square</p>
            </div>
          </div>
          <div className="download-tile">
            <button className="download-btn" id="brochureImagesBtn" type="button" aria-label="Download image folder" aria-describedby="downloadTipFolder">
              <span className="download-glyph is-main" data-icon="folder" aria-hidden="true"></span>
              <span className="download-glyph is-check" data-icon="check" aria-hidden="true"></span>
            </button>
            <button className="download-info" type="button" aria-label="About Download image folder" tabIndex={-1}>
              i
            </button>
            <div className="download-tip" id="downloadTipFolder" role="tooltip">
              <strong>Download image folder</strong>
              <p>Same pages as the PDF, saved as PNGs</p>
            </div>
          </div>
        </div>
        <p className="download-status" id="downloadStatus" hidden></p>

        <section className="group">
          <h2>Listing link</h2>
          <div className="pf-row">
            <input id="pfUrl" type="text" placeholder="Paste a listing link" />
            <button type="button" className="ghost-btn" id="pfPaste">
              Paste
            </button>
          </div>
          <button type="button" className="ghost-btn ghost-btn-full" id="pfFetch">
            Fill listing from link
          </button>
          <p className="pf-status" id="pfStatus" hidden></p>
        </section>

        <section className="group">
          <h2>Header</h2>
          <div className="status-picker" id="statusPicker" role="listbox" aria-label="Listing header">
            <div className="status-coming-group" id="comingSoonGroup">
              <button type="button" className="status-card status-available-on" data-status="available-on" aria-pressed="false" hidden>
                <span id="availableOnLabel">Available on</span>
                <input id="comingSoonDate" className="coming-soon-date" type="date" aria-label="Date the unit is available" />
              </button>
              <button type="button" className="status-card" data-status="coming-soon" aria-pressed="false">
                Coming soon
              </button>
            </div>
            <button type="button" className="status-card" data-status="available-now" aria-pressed="false">
              Available now
            </button>
            <button type="button" className="status-card is-active" data-status="just-leased" aria-pressed="true">
              Just leased
            </button>
            <button type="button" className="status-card" data-status="just-sold" aria-pressed="false">
              Just sold
            </button>
          </div>
        </section>

        <section className="group">
          <h2>Text color</h2>
          <p className="color-target-label" id="colorTargetLabel">
            Click a text box on the preview
          </p>
          <div className="color-row">
            <input id="textColor" type="color" defaultValue="#081d56" disabled aria-label="Text color" />
            <div className="color-swatches" id="colorSwatches">
              <button type="button" className="color-swatch" data-color="#081d56" aria-label="Navy" style={{ background: "#081d56" }}></button>
              <button type="button" className="color-swatch" data-color="#1754ea" aria-label="Blue" style={{ background: "#1754ea" }}></button>
              <button type="button" className="color-swatch" data-color="#10182c" aria-label="Black" style={{ background: "#10182c" }}></button>
              <button type="button" className="color-swatch" data-color="#ffffff" aria-label="White" style={{ background: "#ffffff" }}></button>
              <button type="button" className="color-swatch" data-color="#ece7dc" aria-label="Cream" style={{ background: "#ece7dc" }}></button>
            </div>
          </div>
        </section>

        <section className="group">
          <h2>Photos</h2>
          <label className="drop" id="propertyDrop">
            <input id="propertyInput" type="file" accept="image/*" hidden />
            <strong>Property photo</strong>
            <span>Click or drop a high-res image. Square works best.</span>
            <em id="propertyFileName">No file chosen</em>
          </label>
          <p className="pose-label">Agent pose</p>
          <div className="pose-picker" id="posePicker" role="listbox" aria-label="Agent pose">
            <button type="button" className="pose-card is-active" data-pose="crossed" aria-pressed="true">
              <img src="/agents/arms-crossed.png?v=5" alt="" />
              <span>Arms crossed</span>
            </button>
            <button type="button" className="pose-card" data-pose="presenting" aria-pressed="false">
              <img src="/agents/presenting.png?v=5" alt="" />
              <span>Presenting</span>
            </button>
          </div>
          <label className="drop drop-compact" id="agentDrop">
            <input id="agentInput" type="file" accept="image/*" hidden />
            <strong>Or upload another crop</strong>
            <span>PNG with a transparent background.</span>
            <em id="agentFileName">Optional</em>
          </label>
          <div className="sliders">
            <label>
              Photo position
              <input id="photoPos" type="range" min="0" max="100" defaultValue="50" />
            </label>
            <label>
              Agent size
              <input id="agentScale" type="range" min="70" max="140" defaultValue="76" />
            </label>
            <label>
              Agent left / right
              <input id="agentX" type="range" min="-400" max="900" defaultValue="-14" />
            </label>
            <label>
              Agent up / down
              <input id="agentY" type="range" min="-500" max="400" defaultValue="0" />
            </label>
          </div>
        </section>
      </aside>

      <main className="stage">
        <div className="stage-bar">
          <div className="preview-switch" id="previewSwitch" role="tablist" aria-label="Preview mode">
            <button type="button" data-preview="listing" className="is-active" role="tab" aria-selected="true">
              Listing
            </button>
            <button type="button" data-preview="brochure" role="tab" aria-selected="false">
              Brochure
            </button>
          </div>
          <span id="stageHint">Click text to edit · paste a photo onto the preview</span>
        </div>
        <div className="preview-wrap" id="previewWrap">
          <div
            className="preview-frame"
            id="previewFrame"
            tabIndex={0}
            role="img"
            aria-label="Listing preview. Paste or drop a property photo."
          >
            <article className="listing" id="listing">
              <div className="listing-bg">
                <img id="bgImage" alt="" src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==" />
                <div className="bg-fallback" id="bgFallback">
                  Paste or drop a property photo
                </div>
              </div>

              <div className="brand">
                <img className="brand-logo" id="brandLogo" alt="" hidden />
                <span className="brand-name" id="brandName">Your agency</span>
                <span className="brand-sub" id="brandSub"></span>
              </div>

              <div className="card" id="glassCard">
                <div className="card-face">
                  <div className="card-blur-clip">
                    <img id="bgBlur" alt="" src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==" />
                  </div>
                  <div className="card-frost"></div>
                  <div className="card-body">
                    <div className="headline">
                      <p className="kicker is-edit" id="justWord" contentEditable spellCheck={false}>
                        JUST
                      </p>
                      <p className="status is-edit" id="statusWord" contentEditable spellCheck={false}>
                        LEASED
                      </p>
                      <p className="pname is-edit" id="propertyName" contentEditable spellCheck={false}>
                        Amaranta 1
                      </p>
                      <p className="ploc is-edit" id="location" contentEditable spellCheck={false}>
                        Villanova, Dubai
                      </p>
                      <p className="pnote is-edit" id="note" contentEditable spellCheck={false}>
                        Leased within 4 days of listing.
                      </p>
                    </div>

                    <div className="stats">
                      <div className="stat">
                        <span className="stat-icon" data-icon="bed"></span>
                        <strong className="is-edit" id="stat0Value" contentEditable spellCheck={false}>
                          3
                        </strong>
                        <span className="is-edit" id="stat0Label" contentEditable spellCheck={false}>
                          Bedrooms
                        </span>
                      </div>
                      <div className="stat">
                        <span className="stat-icon" data-icon="area"></span>
                        <strong className="is-edit" id="stat1Value" contentEditable spellCheck={false}>
                          2,100
                        </strong>
                        <span className="is-edit" id="stat1Label" contentEditable spellCheck={false}>
                          Sq. Ft.
                        </span>
                      </div>
                      <div className="stat">
                        <span className="stat-icon" data-icon="coins"></span>
                        <strong className="is-edit" id="stat2Value" contentEditable spellCheck={false}>
                          AED 165,000
                        </strong>
                        <span className="is-edit" id="stat2Label" contentEditable spellCheck={false}>
                          Annual Rent
                        </span>
                      </div>
                      <div className="stat">
                        <span className="stat-icon" data-icon="doc"></span>
                        <strong className="is-edit" id="stat3Value" contentEditable spellCheck={false}>
                          2
                        </strong>
                        <span className="is-edit" id="stat3Label" contentEditable spellCheck={false}>
                          Cheques
                        </span>
                      </div>
                      <div className="stat">
                        <span className="stat-icon" data-icon="cal"></span>
                        <strong className="is-edit" id="stat4Value" contentEditable spellCheck={false}>
                          1y+
                        </strong>
                        <span className="is-edit" id="stat4Label" contentEditable spellCheck={false}>
                          Lease Term
                        </span>
                      </div>
                    </div>

                    <div className="agent-row">
                      <p className="aname is-edit" id="agentName" contentEditable spellCheck={false}>
                        Agent name
                      </p>
                      <div className="contacts">
                        <span>
                          <i data-icon="phone"></i>
                          <b className="is-edit" id="phone" contentEditable spellCheck={false}>
                            Phone
                          </b>
                        </span>
                        <span>
                          <i data-icon="mail"></i>
                          <b className="is-edit" id="email" contentEditable spellCheck={false}>
                            Email
                          </b>
                        </span>
                        <span>
                          <i data-icon="ig"></i>
                          <b className="is-edit" id="instagram" contentEditable spellCheck={false}>
                            Instagram
                          </b>
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="card-glare"></div>
                <div className="card-rim" id="glassRim" aria-hidden="true"></div>
                <p className="coming-date is-edit" id="comingDate" hidden contentEditable spellCheck={false}></p>
              </div>

              <img className="agent-cutout" id="agentImage" alt="" src="/agents/arms-crossed.png?v=5" />
            </article>
          </div>
          <aside className="listing-gallery" id="listingGallery" hidden>
            <p className="listing-gallery-label">Photos</p>
            <div className="listing-gallery-list" id="listingGalleryList"></div>
          </aside>
          <div className="brochure-preview" id="brochurePreview" hidden>
            <p className="brochure-empty" id="brochureEmpty">
              Paste a listing link to preview the brochure.
            </p>
            <div className="brochure-pages" id="brochurePages"></div>
          </div>
        </div>
      </main>
    </div>
  );
}
