"use client";

import { memo } from "react";

function Edit({ as: Tag = "p", text = "", ...props }) {
  return (
    <Tag
      contentEditable="true"
      spellCheck={false}
      suppressContentEditableWarning
      ref={(el) => {
        if (!el || el.dataset.ready) return;
        el.textContent = text;
        el.dataset.ready = "1";
      }}
      {...props}
    />
  );
}

export const StudioMarkup = memo(function StudioMarkup({ cutoutUrl = "", poses = [] }) {
  return (
    <div className="app">
      <aside className="panel" id="studioPanel">
        <div className="panel-main" id="panelMain">
        <header className="panel-head download-tile is-help-only">
          <button className="download-info" type="button" aria-label="About Listing Studio" tabIndex={-1}>
            i
          </button>
          <div className="download-tip" id="studioHelpTip" role="tooltip">
            <strong>How it works</strong>
            <p>Pick a pose, drop in the property photo, then click any text on the preview to style it.</p>
          </div>
        </header>

        <section className="group is-first">
          <h2>Listing link</h2>
          <div className="pf-row">
            <input id="pfUrl" type="text" placeholder="Paste a listing link" />
            <button type="button" className="ghost-btn" id="pfPaste">
              Paste
            </button>
          </div>
          <p className="pf-status" id="pfStatus" hidden></p>
        </section>

        <section className="group">
          <h2>Header</h2>
          <div className="status-picker" id="statusPicker" role="listbox" aria-label="Listing header">
            <div className="slide-well" id="comingSoonGroup" data-index="-1">
              <b className="slide-lid" aria-hidden="true" hidden></b>
              <button type="button" className="status-card" data-status="coming-soon" aria-pressed="false">
                Coming soon
              </button>
              <button type="button" className="status-card status-available-on" data-status="available-on" aria-pressed="false" hidden>
                <span id="availableOnLabel">Available on</span>
                <input id="comingSoonDate" className="coming-soon-date" type="date" aria-label="Date the unit is available" />
              </button>
              <button type="button" className="status-card" data-status="available-now" aria-pressed="false">
                Available now
              </button>
            </div>
            <div className="slide-well" id="statusJustGroup" data-index="0">
              <b className="slide-lid" aria-hidden="true"></b>
              <button type="button" className="status-card is-active" data-status="just-leased" aria-pressed="true">
                Just leased
              </button>
              <button type="button" className="status-card" data-status="just-sold" aria-pressed="false">
                Just sold
              </button>
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
          <div
            className="pose-picker slide-well is-pose"
            id="posePicker"
            role="listbox"
            aria-label="Agent pose"
            data-index="0"
            style={{ "--slots": poses.length }}
          >
            <b className="slide-lid" aria-hidden="true"></b>
            {poses.map((url, index) => {
              const slot = index + 1;
              return (
                <button
                  key={slot}
                  type="button"
                  className={`pose-card${url ? " is-filled" : " is-empty"}`}
                  data-pose={slot}
                  aria-pressed="false"
                  aria-label={url ? `Pose ${slot}` : `Add pose ${slot}`}
                >
                  <span className="pose-thumb">
                    <img src={url || undefined} alt="" hidden={!url} />
                    <i className="pose-add" aria-hidden="true">
                      +
                    </i>
                  </span>
                  <span className="pose-num">{slot}</span>
                </button>
              );
            })}
          </div>
          <input id="poseInput" type="file" accept="image/png,image/webp" hidden />
          <p className="pose-status" id="poseStatus" hidden></p>
          <label className="drop drop-compact" id="agentDrop">
            <input id="agentInput" type="file" accept="image/*" hidden />
            <strong>Or upload another crop</strong>
            <span>PNG with a transparent background.</span>
            <em id="agentFileName">Optional</em>
          </label>
          <div className="sliders">
            <label>
              Agent size
              <input id="agentScale" type="range" min="70" max="140" defaultValue="76" />
            </label>
          </div>
        </section>
        </div>
        <div className="panel-editor" id="panelEditor" aria-hidden="true">
          <textarea id="textEditorValue" rows="3" spellCheck={false} aria-label="Selected text" />
          <div className="color-row">
            <input id="textColor" type="color" defaultValue="#081d56" disabled aria-label="Text color" />
            <div className="color-swatches" id="colorSwatches">
              <button type="button" className="color-swatch" data-color="#081d56" aria-label="Navy" style={{ background: "#081d56" }}></button>
              <button type="button" className="color-swatch" data-color="#042f2e" aria-label="Deep teal" style={{ background: "#042f2e" }}></button>
              <button type="button" className="color-swatch" data-color="#3d9a7a" aria-label="Turquoise" style={{ background: "#3d9a7a" }}></button>
              <button type="button" className="color-swatch" data-color="#eab308" aria-label="Gold" style={{ background: "#eab308" }}></button>
              <button type="button" className="color-swatch" data-color="#0ea5e9" aria-label="Sky" style={{ background: "#0ea5e9" }}></button>
              <button type="button" className="color-swatch" data-color="#ffffff" aria-label="White" style={{ background: "#ffffff" }}></button>
              <button type="button" className="color-swatch" data-color="#f4f0e8" aria-label="Cream" style={{ background: "#f4f0e8" }}></button>
            </div>
          </div>
          <div className="text-editor-size">
            <span id="textSizeValue">24</span>
            <input id="textSize" type="range" min="10" max="96" defaultValue="24" aria-label="Text size" />
          </div>
          <div className="text-font-picker" id="textFonts">
            <div className="slide-well" data-index="-1">
              <b className="slide-lid" aria-hidden="true" hidden></b>
              <button type="button" data-font="montserrat" style={{ fontFamily: "var(--font-montserrat), Montserrat, sans-serif" }}>
                Montserrat
              </button>
              <button type="button" data-font="outfit" style={{ fontFamily: "var(--font-outfit), Outfit, sans-serif" }}>
                Outfit
              </button>
            </div>
            <div className="slide-well" data-index="-1">
              <b className="slide-lid" aria-hidden="true" hidden></b>
              <button type="button" data-font="playfair" style={{ fontFamily: "var(--font-playfair), 'Playfair Display', serif" }}>
                Playfair
              </button>
              <button type="button" data-font="fraunces" style={{ fontFamily: "var(--font-fraunces), Fraunces, serif" }}>
                Fraunces
              </button>
            </div>
          </div>
        </div>
      </aside>

      <main className="stage">
        <div className="stage-bar">
          <div className="preview-switch slide-well" id="previewSwitch" role="tablist" aria-label="Preview mode" data-index="0">
            <b className="slide-lid" aria-hidden="true"></b>
            <button type="button" data-preview="listing" className="is-active" role="tab" aria-selected="true">
              Listing
            </button>
            <button type="button" data-preview="brochure" role="tab" aria-selected="false">
              Brochure
            </button>
          </div>
          <div className="stage-downloads" id="stageDownloads" data-step="closed">
            <button
              className="download-launch"
              id="downloadLaunch"
              type="button"
              aria-expanded="false"
              aria-controls="downloadStack"
              aria-label="Download"
            >
              <span className="download-glyph" data-icon="download" aria-hidden="true"></span>
            </button>
            <div className="download-stack" id="downloadStack" aria-hidden="true">
              <div className="download-tile">
                <button className="download-btn" id="downloadBtn" type="button" title="Instagram square" aria-label="Download PNG">
                  <span className="download-glyph is-main" data-icon="image" aria-hidden="true"></span>
                  <span className="download-glyph is-check" data-icon="check" aria-hidden="true"></span>
                </button>
              </div>
              <div className="download-tile">
                <button className="download-btn" id="brochureBtn" type="button" title="PDF brochure" aria-label="Download PDF brochure">
                  <span className="download-glyph is-main" data-icon="page" aria-hidden="true"></span>
                  <span className="download-glyph is-check" data-icon="check" aria-hidden="true"></span>
                </button>
              </div>
              <div className="download-tile">
                <button className="download-btn" id="brochureImagesBtn" type="button" title="Image folder" aria-label="Download image folder">
                  <span className="download-glyph is-main" data-icon="folder" aria-hidden="true"></span>
                  <span className="download-glyph is-check" data-icon="check" aria-hidden="true"></span>
                </button>
              </div>
            </div>
            <p className="download-status" id="downloadStatus" hidden></p>
          </div>
        </div>
        <div className="preview-wrap has-gallery" id="previewWrap">
          <div
            className="preview-frame"
            id="previewFrame"
            tabIndex={0}
            role="img"
            aria-label="Listing preview. Paste or drop a property photo."
          >
            <article className={`listing${cutoutUrl ? " has-agent pose-custom" : ""}`} id="listing">
              <div className="listing-bg">
                <img id="bgImage" alt="" src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==" />
                <div className="bg-fallback" id="bgFallback">
                  Paste or drop a property photo
                </div>
              </div>

              <div className="brand">
                <img className="brand-logo" id="brandLogo" alt="" hidden />
                <span className="brand-name" id="brandName"></span>
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
                      <Edit className="kicker is-edit" id="justWord" text="JUST" />
                      <Edit className="status is-edit" id="statusWord" text="LEASED" />
                      <Edit className="pname is-edit" id="propertyName" text="Amaranta 1" />
                      <Edit className="ploc is-edit" id="location" text="Villanova, Dubai" />
                      <Edit className="pnote is-edit" id="note" text="Leased within 4 days of listing." />
                    </div>

                    <div className="stats">
                      <div className="stat">
                        <span className="stat-icon" data-icon="bed"></span>
                        <Edit as="strong" className="is-edit" id="stat0Value" text="3" />
                        <Edit as="span" className="is-edit" id="stat0Label" text="Bedrooms" />
                      </div>
                      <div className="stat">
                        <span className="stat-icon" data-icon="area"></span>
                        <Edit as="strong" className="is-edit" id="stat1Value" text="2,100" />
                        <Edit as="span" className="is-edit" id="stat1Label" text="Sq. Ft." />
                      </div>
                      <div className="stat">
                        <span className="stat-icon" data-icon="coins"></span>
                        <Edit as="strong" className="is-edit" id="stat2Value" text="AED 165,000" />
                        <Edit as="span" className="is-edit" id="stat2Label" text="Annual Rent" />
                      </div>
                      <div className="stat">
                        <span className="stat-icon" data-icon="doc"></span>
                        <Edit as="strong" className="is-edit" id="stat3Value" text="2" />
                        <Edit as="span" className="is-edit" id="stat3Label" text="Cheques" />
                      </div>
                      <div className="stat">
                        <span className="stat-icon" data-icon="cal"></span>
                        <Edit as="strong" className="is-edit" id="stat4Value" text="1y+" />
                        <Edit as="span" className="is-edit" id="stat4Label" text="Lease Term" />
                      </div>
                    </div>

                    <div className="agent-row">
                      <Edit className="aname is-edit" id="agentName" text="Agent name" />
                      <div className="contacts">
                        <span>
                          <i data-icon="phone"></i>
                          <Edit as="b" className="is-edit" id="phone" text="Phone" />
                        </span>
                        <span>
                          <i data-icon="mail"></i>
                          <Edit as="b" className="is-edit" id="email" text="Email" />
                        </span>
                        <span>
                          <i data-icon="ig"></i>
                          <Edit as="b" className="is-edit" id="instagram" text="Instagram" />
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="card-glare"></div>
                <div className="card-rim" id="glassRim" aria-hidden="true"></div>
                <Edit className="coming-date is-edit" id="comingDate" hidden />
              </div>

              <img
                className="agent-cutout"
                id="agentImage"
                alt=""
                src={cutoutUrl || undefined}
                hidden={!cutoutUrl}
                draggable={false}
              />
            </article>
          </div>
          <div className="brochure-preview" id="brochurePreview" aria-hidden="true" inert>
            <p className="brochure-empty" id="brochureEmpty">
              Paste a listing link to preview the brochure.
            </p>
            <div className="brochure-pages" id="brochurePages"></div>
          </div>
          <aside className="listing-gallery" id="listingGallery" aria-hidden="false">
            <p className="listing-gallery-label">Photos</p>
            <div className="listing-gallery-list" id="listingGalleryList"></div>
            <label className="listing-gallery-add">
              <input type="file" accept="image/*" multiple hidden />
              <span className="listing-gallery-add-plus" aria-hidden="true">+</span>
              <span>Add photo</span>
            </label>
          </aside>
          <aside className="listing-gallery" id="brochureGallery" aria-hidden="true" inert>
            <p className="listing-gallery-label">Photos</p>
            <div className="listing-gallery-list" id="brochureGalleryList"></div>
            <label className="listing-gallery-add">
              <input type="file" accept="image/*" multiple hidden />
              <span className="listing-gallery-add-plus" aria-hidden="true">+</span>
              <span>Add photo</span>
            </label>
          </aside>
        </div>
      </main>
    </div>
  );
});
