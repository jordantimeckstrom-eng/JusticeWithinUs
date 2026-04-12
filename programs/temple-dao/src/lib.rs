use anchor_lang::prelude::*;

declare_id!("TiMeFUXyR9nTgmiiQgx3wH2qzoyMiY5G4seySXMA9pP");

const SOVEREIGN_BASE_NAME: &str = "jordaneckstrom.base.eth";

#[program]
pub mod temple_dao {
    use super::*;

    pub fn bind_to_base_name(ctx: Context<BindToBaseName>, base_name: String) -> Result<()> {
        require!(
            base_name == SOVEREIGN_BASE_NAME,
            ErrorCode::UnauthorizedName
        );

        let thread = &mut ctx.accounts.phoenix_thread;
        thread.owner = ctx.accounts.authority.key();
        thread.base_name = base_name;
        thread.bound_since = Clock::get()?.unix_timestamp;

        msg!(
            "Phoenix Thread bound to sovereign Base name: {}",
            thread.base_name
        );

        Ok(())
    }
}

#[derive(Accounts)]
pub struct BindToBaseName<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,

    #[account(
        init_if_needed,
        payer = authority,
        space = PhoenixThread::space(SOVEREIGN_BASE_NAME),
        seeds = [b"phoenix-thread", authority.key().as_ref()],
        bump
    )]
    pub phoenix_thread: Account<'info, PhoenixThread>,

    pub system_program: Program<'info, System>,
}

#[account]
pub struct PhoenixThread {
    pub owner: Pubkey,
    pub base_name: String,
    pub bound_since: i64,
    pub alignment_score: u64,
}

impl PhoenixThread {
    pub fn space(base_name: &str) -> usize {
        // 8 anchor discriminator
        // 32 owner
        // 4 string prefix + bytes
        // 8 bound_since
        // 8 alignment_score
        8 + 32 + 4 + base_name.len() + 8 + 8
    }
}

#[error_code]
pub enum ErrorCode {
    #[msg("Base name is not authorized for this sovereign thread.")]
    UnauthorizedName,
}
