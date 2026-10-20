"""Create original, locally hosted language-test explainers. No external media."""
import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parents[1] / '.tools' / 'video'))
from PIL import Image, ImageDraw, ImageFont
import imageio_ffmpeg
import subprocess
import math

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'dist' / 'assets'
OUT.mkdir(exist_ok=True)
W, H, FPS, SECONDS = 1280, 720, 24, 6
NAVY, WHITE, ORANGE = '#102c40', '#faf7f0', '#ed985b'
font_root = Path('C:/Windows/Fonts')
def font(size, bold=False):
    return ImageFont.truetype(str(font_root / ('arialbd.ttf' if bold else 'arial.ttf')), size)

copy = {
 'en': [
  ('Your language. Your next chapter.', 'Why language tests matter', 'Prepare for study, work and opportunities abroad.'),
  ('01 / DEMONSTRATE YOUR SKILLS', 'Make your skills visible.', 'Language tests assess listening, reading, speaking and writing.'),
  ('02 / PLAN YOUR STUDIES', 'Prepare for your next campus.', 'Check the language test and score required by your chosen institution.'),
  ('03 / EXPLORE OPPORTUNITIES', 'Think beyond borders.', 'A language result can support work or migration applications. Requirements vary.'),
  ('04 / CHOOSE YOUR ROUTE', 'English. French. German.', 'IELTS / TCF & TEF / Goethe preparation at Tejis Language Center.'),
  ('05 / START WITH A CONVERSATION', 'Learn. Prepare. Go global.', 'Contact Tejis in Yaoundé: +237 694 92 16 69. Ask about courses and availability.')
 ],
 'fr': [
  ('Votre langue. Votre prochain chapitre.', 'Pourquoi les tests de langue ?', 'Préparez vos études, votre travail et vos projets à l’étranger.'),
  ('01 / VALORISEZ VOS COMPÉTENCES', 'Montrez votre niveau.', 'Les tests évaluent la compréhension et l’expression, à l’oral et à l’écrit.'),
  ('02 / PRÉPAREZ VOS ÉTUDES', 'Votre prochain campus.', 'Vérifiez le test de langue et le score exigés par votre établissement.'),
  ('03 / EXPLOREZ LES POSSIBILITÉS', 'Au-delà des frontières.', 'Un résultat peut soutenir un projet de travail ou d’immigration. Les exigences varient.'),
  ('04 / CHOISISSEZ VOTRE PARCOURS', 'Anglais. Français. Allemand.', 'Préparation IELTS / TCF et TEF / Goethe au Tejis Language Center.'),
  ('05 / ÉCHANGEONS SUR VOTRE PROJET', 'Apprendre. Se préparer. Avancer.', 'Contactez Tejis à Yaoundé : +237 694 92 16 69. Renseignez-vous sur les cours disponibles.')
 ],
 'de': [
  ('Ihre Sprache. Ihr nächstes Kapitel.', 'Warum Sprachprüfungen?', 'Bereiten Sie sich auf Studium, Arbeit und Möglichkeiten im Ausland vor.'),
  ('01 / ZEIGEN SIE IHRE KENNTNISSE', 'Machen Sie Ihr Können sichtbar.', 'Sprachprüfungen bewerten Hören, Lesen, Sprechen und Schreiben.'),
  ('02 / PLANEN SIE IHR STUDIUM', 'Ihr nächster Campus.', 'Prüfen Sie, welchen Sprachtest und welches Ergebnis Ihre Einrichtung verlangt.'),
  ('03 / ENTDECKEN SIE MÖGLICHKEITEN', 'Denken Sie über Grenzen hinaus.', 'Ein Ergebnis kann Bewerbungen für Arbeit oder Migration unterstützen. Die Anforderungen variieren.'),
  ('04 / WÄHLEN SIE IHREN WEG', 'Englisch. Französisch. Deutsch.', 'IELTS- / TCF- und TEF- / Goethe-Vorbereitung im Tejis Language Center.'),
  ('05 / BEGINNEN WIR MIT EINEM GESPRÄCH', 'Lernen. Vorbereiten. Durchstarten.', 'Kontaktieren Sie Tejis in Yaoundé: +237 694 92 16 69. Fragen Sie nach verfügbaren Kursen.')
 ]
}
def wrapped(draw, text, textfont, max_width):
    lines, line = [], ''
    for word in text.split():
        trial = f'{line} {word}'.strip()
        if draw.textlength(trial, font=textfont) > max_width and line:
            lines.append(line)
            line = word
        else:
            line = trial
    return lines + [line]

for language, scenes in copy.items():
    output = OUT / f'language-tests-{language}.mp4'
    args = [imageio_ffmpeg.get_ffmpeg_exe(), '-y', '-f', 'rawvideo', '-vcodec', 'rawvideo', '-pix_fmt', 'rgb24', '-s', f'{W}x{H}', '-r', str(FPS), '-i', '-', '-an', '-c:v', 'libx264', '-preset', 'fast', '-crf', '23', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', str(output)]
    process = subprocess.Popen(args, stdin=subprocess.PIPE, stdout=subprocess.DEVNULL, stderr=subprocess.PIPE)
    for scene, (eyebrow, title, text) in enumerate(scenes):
        base = Image.new('RGB', (W, H), NAVY)
        d = ImageDraw.Draw(base)
        for radius in [175, 245, 315]:
            d.ellipse((1070-radius, 170-radius, 1070+radius, 170+radius), outline='#23485a', width=2)
        d.rounded_rectangle((65, 48, 108, 91), radius=9, fill=ORANGE)
        d.text((120, 46), 'TEJIS', font=font(39, True), fill=WHITE)
        d.text((W-275, 61), 'LANGUAGE CENTER', font=font(18), fill='#bdd0d7')
        d.text((70, 175), eyebrow, font=font(20, True), fill=ORANGE)
        y = 238
        titlefont = font(58, True)
        for line in wrapped(d, title, titlefont, 1060):
            d.text((66, y), line, font=titlefont, fill=WHITE)
            y += 71
        for line in wrapped(d, text, font(29), 1035):
            d.text((70, y+25), line, font=font(29), fill='#cad8df')
            y += 42
        d.text((70, 643), 'YAOUNDÉ  /  CAMEROON', font=font(16), fill='#a9c0cb')
        d.text((1100, 643), f'0{scene+1} / 06', font=font(16), fill='#a9c0cb')
        for frame in range(FPS * SECONDS):
            picture = base.copy()
            p = ImageDraw.Draw(picture)
            t = frame / (FPS * SECONDS - 1)
            x, y = 850 + 320*t, 560 - math.sin(t * math.pi) * 45
            shape = [(-32, 0),(-6,-7),(-16,-24),(-8,-24),(14,-5),(32,0),(14,5),(-8,24),(-16,24),(-6,7)]
            p.line([(x-100,y),(x-45,y)], fill='#8c694e', width=3)
            p.polygon([(x+dx,y+dy) for dx,dy in shape], fill=ORANGE)
            progress = (scene + t) / len(scenes)
            p.rectangle((0,H-5,int(W*progress),H), fill=ORANGE)
            if scene == frame == 0:
                picture.save(OUT / f'language-tests-{language}.jpg', quality=90)
            process.stdin.write(picture.tobytes())
    process.stdin.close()
    error = process.stderr.read().decode(errors='replace')
    if process.wait() != 0:
        raise RuntimeError(error[-2000:])
    print(f'{output.name}: {output.stat().st_size:,} bytes / 36 seconds', flush=True)
    vtt = ['WEBVTT', '']
    for i, (eyebrow, title, text) in enumerate(scenes):
        vtt += [f'00:{i*SECONDS:02d}.000 --> 00:{(i+1)*SECONDS:02d}.000', f'{title} {text}', '']
    (OUT / f'language-tests-{language}.vtt').write_text('\n'.join(vtt), encoding='utf8')
