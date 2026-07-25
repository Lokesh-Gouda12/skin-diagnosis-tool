export const conditions = [
  {
    id: 'nv',
    code: 'NV-01',
    name: 'Melanocytic Nevi',
    common: 'Common Mole',
    risk: 'low',
    description:
      'Clusters of pigment-producing cells that form the ordinary moles most people have. Usually stable for years — the main thing to track is whether one starts changing.',
  },
  {
    id: 'mel',
    code: 'MEL-02',
    name: 'Melanoma',
    common: 'Malignant Melanoma',
    risk: 'high',
    description:
      'A cancer of pigment-producing cells and the most dangerous common skin cancer, due to its ability to spread if caught late. Early detection changes outcomes dramatically — this is the condition screening tools are built around.',
  },
  {
    id: 'bkl',
    code: 'BKL-03',
    name: 'Benign Keratosis',
    common: 'Seborrheic Keratosis & related',
    risk: 'low',
    description:
      'Rough, waxy, "stuck-on" looking patches. Harmless, but can visually mimic more serious lesions — one reason they show up often in misclassification.',
  },
  {
    id: 'bcc',
    code: 'BCC-04',
    name: 'Basal Cell Carcinoma',
    common: 'Most Common Skin Cancer',
    risk: 'high',
    description:
      'Grows slowly and rarely spreads to other organs, but left untreated it can damage surrounding skin and tissue. Typically appears as a pearly bump or a sore that will not heal.',
  },
  {
    id: 'akiec',
    code: 'AKI-05',
    name: 'Actinic Keratosis',
    common: 'Sun-Damage Patch',
    risk: 'moderate',
    description:
      'Rough, scaly patches from cumulative sun exposure. Considered pre-cancerous — a portion can progress to squamous cell carcinoma if left unaddressed.',
  },
  {
    id: 'vasc',
    code: 'VAS-06',
    name: 'Vascular Lesions',
    common: 'Angioma & related',
    risk: 'low',
    description:
      'Growths involving blood vessels near the skin surface, appearing as red or purple marks. Almost always benign.',
  },
  {
    id: 'df',
    code: 'DF-07',
    name: 'Dermatofibroma',
    common: 'Firm Skin Nodule',
    risk: 'low',
    description:
      'A firm, benign nodule often found on the legs, thought to arise from minor skin trauma such as an insect bite. Harmless, but can be mistaken for other growths.',
  },
]

export const abcde = [
  { letter: 'A', label: 'Asymmetry', text: 'One half of the lesion does not match the other.' },
  { letter: 'B', label: 'Border', text: 'Edges are irregular, notched, or poorly defined.' },
  { letter: 'C', label: 'Color', text: 'Uneven shading — mixes of brown, black, red, or white.' },
  { letter: 'D', label: 'Diameter', text: 'Larger than 6mm — roughly the size of a pencil eraser.' },
  { letter: 'E', label: 'Evolving', text: 'Any change in size, shape, color, or sensation over time.' },
]