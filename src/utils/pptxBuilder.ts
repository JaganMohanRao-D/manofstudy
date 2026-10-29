import JSZip from 'jszip';

export interface SlideImageInput {
  base64Jpeg: string; // Base64 without data:image/jpeg;base64, prefix
  width?: number;
  height?: number;
}

/**
 * Builds a standard, native Microsoft PowerPoint (.pptx) presentation file
 * containing sequential high-resolution image slides.
 * Conforms to OpenXML standard (16:9 widescreen layout: 12192000 x 6858000 EMUs).
 */
export async function buildPptxFromSlides(
  slides: SlideImageInput[],
  presentationTitle: string = 'Presentation'
): Promise<Blob> {
  const zip = new JSZip();
  const slideCount = slides.length;
  const emuWidth = 12192000;
  const emuHeight = 6858000;

  // 1. [Content_Types].xml
  let contentTypes = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n' +
    '<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">\n' +
    '  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>\n' +
    '  <Default Extension="xml" ContentType="application/xml"/>\n' +
    '  <Default Extension="jpeg" ContentType="image/jpeg"/>\n' +
    '  <Default Extension="jpg" ContentType="image/jpeg"/>\n' +
    '  <Default Extension="png" ContentType="image/png"/>\n' +
    '  <Override PartName="/ppt/presentation.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.presentation.main+xml"/>\n' +
    '  <Override PartName="/ppt/slideMasters/slideMaster1.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.slideMaster+xml"/>\n' +
    '  <Override PartName="/ppt/slideLayouts/slideLayout1.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.slideLayout+xml"/>\n';

  for (let i = 1; i <= slideCount; i++) {
    contentTypes += `  <Override PartName="/ppt/slides/slide${i}.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.slide+xml"/>\n`;
  }
  contentTypes += '</Types>';
  zip.file('[Content_Types].xml', contentTypes);

  // 2. _rels/.rels
  zip.file(
    '_rels/.rels',
    '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n' +
      '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">\n' +
      '  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="ppt/presentation.xml"/>\n' +
      '</Relationships>'
  );

  // 3. ppt/_rels/presentation.xml.rels
  let pRels =
    '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n' +
    '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">\n' +
    '  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slideMaster" Target="slideMasters/slideMaster1.xml"/>\n';
  for (let i = 1; i <= slideCount; i++) {
    pRels += `  <Relationship Id="rId${i + 1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slide" Target="slides/slide${i}.xml"/>\n`;
  }
  pRels += '</Relationships>';
  zip.file('ppt/_rels/presentation.xml.rels', pRels);

  // 4. ppt/presentation.xml
  let pres =
    '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n' +
    '<p:presentation xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main">\n' +
    '  <p:sldMasterIdLst>\n' +
    '    <p:sldMasterId id="2147483648" r:id="rId1"/>\n' +
    '  </p:sldMasterIdLst>\n' +
    '  <p:sldIdLst>\n';
  for (let i = 1; i <= slideCount; i++) {
    pres += `    <p:sldId id="${255 + i}" r:id="rId${i + 1}"/>\n`;
  }
  pres +=
    '  </p:sldIdLst>\n' +
    '  <p:sldSz cx="12192000" cy="6858000" type="screen16x9"/>\n' +
    '  <p:notesSz cx="6858000" cy="9144000"/>\n' +
    '</p:presentation>';
  zip.file('ppt/presentation.xml', pres);

  // 5. Minimal master & layout
  zip.file(
    'ppt/slideMasters/slideMaster1.xml',
    '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n' +
      '<p:sldMaster xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main">\n' +
      '  <p:cSld><p:spTree><p:nvGrpSpPr><p:cNvPr id="1" name=""/><p:cNvGrpSpPr/><p:nvPr/></p:nvGrpSpPr><p:grpSpPr/></p:spTree></p:cSld>\n' +
      '  <p:clrMap bg1="lt1" tx1="dk1" bg2="lt2" tx2="dk2" accent1="accent1" accent2="accent2" accent3="accent3" accent4="accent4" accent5="accent5" accent6="accent6" hlink="hlink" folHlink="folHlink"/>\n' +
      '  <p:sldLayoutIdLst><p:sldLayoutId id="2147483649" r:id="rId1"/></p:sldLayoutIdLst>\n' +
      '</p:sldMaster>'
  );

  zip.file(
    'ppt/slideMasters/_rels/slideMaster1.xml.rels',
    '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n' +
      '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">\n' +
      '  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slideLayout" Target="../slideLayouts/slideLayout1.xml"/>\n' +
      '</Relationships>'
  );

  zip.file(
    'ppt/slideLayouts/slideLayout1.xml',
    '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n' +
      '<p:sldLayout xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main" type="blank">\n' +
      '  <p:cSld name="Blank"><p:spTree><p:nvGrpSpPr><p:cNvPr id="1" name=""/><p:cNvGrpSpPr/><p:nvPr/></p:nvGrpSpPr><p:grpSpPr/></p:spTree></p:cSld>\n' +
      '</p:sldLayout>'
  );

  zip.file(
    'ppt/slideLayouts/_rels/slideLayout1.xml.rels',
    '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n' +
      '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">\n' +
      '  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slideMaster" Target="../slideMasters/slideMaster1.xml"/>\n' +
      '</Relationships>'
  );

  // 6. Slides, rels, and media
  for (let i = 1; i <= slideCount; i++) {
    const slide = slides[i - 1];
    zip.file(`ppt/media/image${i}.jpeg`, slide.base64Jpeg, { base64: true });

    zip.file(
      `ppt/slides/_rels/slide${i}.xml.rels`,
      '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n' +
        '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">\n' +
        '  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slideLayout" Target="../slideLayouts/slideLayout1.xml"/>\n' +
        `  <Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" Target="../media/image${i}.jpeg"/>\n` +
        '</Relationships>'
    );

    // Calculate aspect ratio scaling to center inside 16:9 canvas
    let picWidthEmu = emuWidth;
    let picHeightEmu = emuHeight;
    let offX = 0;
    let offY = 0;

    if (slide.width && slide.height && slide.width > 0 && slide.height > 0) {
      const slideAspect = emuWidth / emuHeight;
      const imgAspect = slide.width / slide.height;

      if (imgAspect > slideAspect) {
        picWidthEmu = emuWidth;
        picHeightEmu = Math.round(emuWidth / imgAspect);
        offX = 0;
        offY = Math.max(0, Math.round((emuHeight - picHeightEmu) / 2));
      } else {
        picHeightEmu = emuHeight;
        picWidthEmu = Math.round(emuHeight * imgAspect);
        offX = Math.max(0, Math.round((emuWidth - picWidthEmu) / 2));
        offY = 0;
      }
    }

    zip.file(
      `ppt/slides/slide${i}.xml`,
      '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n' +
        '<p:sld xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main">\n' +
        '  <p:cSld>\n' +
        '    <p:spTree>\n' +
        '      <p:nvGrpSpPr><p:cNvPr id="1" name=""/><p:cNvGrpSpPr/><p:nvPr/></p:nvGrpSpPr>\n' +
        '      <p:grpSpPr/>\n' +
        '      <p:pic>\n' +
        '        <p:nvPicPr>\n' +
        `          <p:cNvPr id="2" name="Slide ${i} - ${presentationTitle}"/>\n` +
        '          <p:cNvPicPr><a:picLocks noChangeAspect="1"/></p:cNvPicPr>\n' +
        '          <p:nvPr/>\n' +
        '        </p:nvPicPr>\n' +
        '        <p:blipFill>\n' +
        '          <a:blip r:embed="rId2"/>\n' +
        '          <a:stretch><a:fillRect/></a:stretch>\n' +
        '        </p:blipFill>\n' +
        '        <p:spPr>\n' +
        `          <a:xfrm><a:off x="${offX}" y="${offY}"/><a:ext cx="${picWidthEmu}" cy="${picHeightEmu}"/></a:xfrm>\n` +
        '          <a:prstGeom prst="rect"><a:avLst/></a:prstGeom>\n' +
        '        </p:spPr>\n' +
        '      </p:pic>\n' +
        '    </p:spTree>\n' +
        '  </p:cSld>\n' +
        '</p:sld>'
    );
  }

  return await zip.generateAsync({
    type: 'blob',
    mimeType: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  });
}
