-- Migração: Adicionar metas nutricionais ao perfil do usuário
-- Data: 2026-01-04

ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS meta_calorias INTEGER DEFAULT NULL;
ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS meta_proteinas INTEGER DEFAULT NULL;
ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS meta_carboidratos INTEGER DEFAULT NULL;
ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS meta_gorduras INTEGER DEFAULT NULL;
ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS meta_agua INTEGER DEFAULT NULL;

-- Comentários
COMMENT ON COLUMN usuarios.meta_calorias IS 'Meta diária de calorias em kcal';
COMMENT ON COLUMN usuarios.meta_proteinas IS 'Meta diária de proteínas em gramas';
COMMENT ON COLUMN usuarios.meta_carboidratos IS 'Meta diária de carboidratos em gramas';
COMMENT ON COLUMN usuarios.meta_gorduras IS 'Meta diária de gorduras em gramas';
COMMENT ON COLUMN usuarios.meta_agua IS 'Meta diária de água em ml';
