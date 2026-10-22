/**
 * Public operator name and company identification.
 * legalName (razão social), cnpj, and address stay empty until they are filled in.
 * Blank values are omitted from the site.
 */
export const legalConfig = {
  operatorName: "Equipe Patrocino",
  productName: "Patrocino",
  legalName: "",
  cnpj: "",
  address: "",
  dpoEmail: "contato@patrocino.com",
  reportEmail: "denuncia@patrocino.com",
  termsVersion: "2026-10-22",
} as const;

export function filledCompanyFields() {
  return {
    legalName: legalConfig.legalName.trim(),
    cnpj: legalConfig.cnpj.trim(),
    address: legalConfig.address.trim(),
  };
}
