"""Mide el desgaste: huecos dentro de la letra (tinta de la letra regular que falta en la versión gastada).
Uso: metricas(regular_bool, gastada_bool, cap_px) -> dict"""
import numpy as np
from scipy import ndimage as ndi
from skimage import measure
def metricas(R, G, cap):
    interior = ndi.binary_erosion(R, iterations=max(2, int(cap*0.012)))   # lejos del borde
    hueco = interior & ~G
    lab = measure.label(hueco, connectivity=2)
    props = measure.regionprops(lab)
    areas = np.array([p.area for p in props]) / cap**2 * 1e4               # en diezmilésimas de cap²
    elong = np.array([p.axis_major_length / max(p.axis_minor_length, 1) for p in props if p.area > 4])
    ang = np.array([np.degrees(p.orientation) for p in props if p.area > 20 and p.axis_major_length > 2*max(p.axis_minor_length,1)])
    sol = np.array([p.solidity for p in props if p.area > 20])
    # densidad local: fracción de hueco en ventanas de 0,25 cap
    w = int(cap*0.1); dens=[]
    for y in range(0, R.shape[0]-w, w):
        for x in range(0, R.shape[1]-w, w):
            m = interior[y:y+w, x:x+w]
            if m.mean() > 0.5: dens.append(hueco[y:y+w, x:x+w][m].mean())
    dens = np.array(dens)
    # perímetro por área de hueco (qué tan quebrado/fino es)
    per = sum(p.perimeter for p in props) / max(hueco.sum(),1) * cap
    # orden de chapa: autocorrelación del hueco en el vector de la red (0,042 cap en diagonal) frente a medio paso
    hm = hueco.astype(float) - hueco[interior].mean(); hm[~interior] = 0
    F = np.fft.rfft2(hm); ac = np.fft.irfft2(F * np.conj(F), s=hm.shape); ac /= ac[0, 0]
    d = 0.028 * cap
    def acv(dx, dy): return ac[int(round(dy)) % ac.shape[0], int(round(dx)) % ac.shape[1]]
    picos = np.mean([acv(d, d), acv(-d, d), acv(2*d, 0), acv(0, 2*d)]); valles = np.mean([acv(d, 0), acv(0, d), acv(d/2, d/2)])
    orden = round(float(picos - valles), 3)
    return dict(orden=orden, hueco=round(hueco.sum()/interior.sum(),3), n_por_cap2=round(len(props)/(interior.sum()/cap**2),1),
                area_p50=round(float(np.median(areas)),2) if len(areas) else 0, area_p90=round(float(np.percentile(areas,90)),2) if len(areas) else 0,
                area_max=round(float(areas.max()),1) if len(areas) else 0,
                elong_p50=round(float(np.median(elong)),2), solidez_p50=round(float(np.median(sol)),2),
                ang_diag=round(float(np.mean((np.abs(np.abs(ang)-45)<20))),2) if len(ang) else 0,
                dens_p10=round(float(np.percentile(dens,10)),3), dens_p50=round(float(np.median(dens)),3), dens_p90=round(float(np.percentile(dens,90)),3),
                perim_area=round(per,1))
if __name__ == '__main__':
    from PIL import Image
    im = np.array(Image.open('med.png').convert('L'))
    R = im[:720] < 128; G = im[720:1440] < 128
    print('STEEL', metricas(R, G, 488))
