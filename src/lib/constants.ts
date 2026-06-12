import { 
  Building2, 
  IdCard, 
  Scale, 
  HeartPulse, 
  Landmark, 
  GraduationCap, 
  Zap, 
  Building, 
  MapPin 
} from 'lucide-react';

export const TASK_CATEGORIES = [
  {
    value: "government_schemes",
    label: "Government Schemes",
    icon: Building2,
  },
  {
    value: "identity_documents",
    label: "Identity Documents",
    icon: IdCard,
  },
  {
    value: "property_legal",
    label: "Property & Legal",
    icon: Scale,
  },
  {
    value: "health_insurance",
    label: "Health Insurance",
    icon: HeartPulse,
  },
  {
    value: "banking",
    label: "Banking",
    icon: Landmark,
  },
  {
    value: "education",
    label: "Education",
    icon: GraduationCap,
  },
  {
    value: "utilities",
    label: "Utilities",
    icon: Zap,
  },
  {
    value: "municipal_services",
    label: "Municipal Services",
    icon: Building,
  },
  {
    value: "other",
    label: "Other",
    icon: MapPin,
  },
];
