use anchor_lang::prelude::*;

declare_id!("TiMeFUXyR9nTgmiiQgx3wH2qzoyMiY5G4seySXMA9pP");

const MAX_TEXT_LEN: usize = 280;
const VOTING_PERIOD_SECS: i64 = 3 * 24 * 60 * 60;
const MIN_QUORUM_WEIGHT: u64 = 10;
const PASS_PERCENT_BPS: u64 = 6000;

#[program]
pub mod temple_dao {
    use super::*;

    pub fn initialize_dao(ctx: Context<InitializeDao>) -> Result<()> {
        let dao = &mut ctx.accounts.dao;
        dao.authority = ctx.accounts.authority.key();
        dao.proposal_count = 0;
        Ok(())
    }

    pub fn propose(
        ctx: Context<Propose>,
        text: String,
        alignment_weight_snapshot: u64,
    ) -> Result<()> {
        require!(text.as_bytes().len() <= MAX_TEXT_LEN, ErrorCode::TextTooLong);
        require!(alignment_weight_snapshot > 0, ErrorCode::InvalidWeight);

        let dao = &mut ctx.accounts.dao;
        let proposal = &mut ctx.accounts.proposal;

        proposal.id = dao.proposal_count;
        proposal.proposer = ctx.accounts.proposer.key();
        proposal.text = text;
        proposal.alignment_weight_snapshot = alignment_weight_snapshot;
        proposal.votes_for = 0;
        proposal.votes_against = 0;
        proposal.created_at = Clock::get()?.unix_timestamp;
        proposal.ends_at = proposal.created_at + VOTING_PERIOD_SECS;
        proposal.executed = false;
        proposal.bump = ctx.bumps.proposal;

        dao.proposal_count = dao
            .proposal_count
            .checked_add(1)
            .ok_or(ErrorCode::MathOverflow)?;

        emit!(ProposalCreated {
            id: proposal.id,
            proposer: proposal.proposer,
            ends_at: proposal.ends_at,
        });

        Ok(())
    }

    pub fn vote(ctx: Context<Vote>, vote_for: bool, voter_weight: u64) -> Result<()> {
        let proposal = &mut ctx.accounts.proposal;
        let vote_record = &mut ctx.accounts.vote_record;
        let now = Clock::get()?.unix_timestamp;

        require!(now <= proposal.ends_at, ErrorCode::VotingClosed);
        require!(!proposal.executed, ErrorCode::AlreadyExecuted);
        require!(voter_weight > 0, ErrorCode::InvalidWeight);

        vote_record.proposal = proposal.key();
        vote_record.voter = ctx.accounts.voter.key();
        vote_record.weight = voter_weight;
        vote_record.vote_for = vote_for;
        vote_record.bump = ctx.bumps.vote_record;

        if vote_for {
            proposal.votes_for = proposal
                .votes_for
                .checked_add(voter_weight)
                .ok_or(ErrorCode::MathOverflow)?;
        } else {
            proposal.votes_against = proposal
                .votes_against
                .checked_add(voter_weight)
                .ok_or(ErrorCode::MathOverflow)?;
        }

        emit!(VoteCast {
            proposal: proposal.key(),
            voter: ctx.accounts.voter.key(),
            vote_for,
            weight: voter_weight,
        });

        Ok(())
    }

    pub fn enact(ctx: Context<Enact>) -> Result<()> {
        let proposal = &mut ctx.accounts.proposal;
        let now = Clock::get()?.unix_timestamp;

        require!(now > proposal.ends_at, ErrorCode::VotingStillOpen);
        require!(!proposal.executed, ErrorCode::AlreadyExecuted);

        let total = proposal
            .votes_for
            .checked_add(proposal.votes_against)
            .ok_or(ErrorCode::MathOverflow)?;
        require!(total >= MIN_QUORUM_WEIGHT, ErrorCode::QuorumNotMet);

        let for_bps = proposal
            .votes_for
            .checked_mul(10_000)
            .ok_or(ErrorCode::MathOverflow)?
            .checked_div(total)
            .ok_or(ErrorCode::MathOverflow)?;
        require!(for_bps >= PASS_PERCENT_BPS, ErrorCode::ThresholdNotMet);

        proposal.executed = true;

        emit!(ProposalEnacted {
            proposal: proposal.key(),
            votes_for: proposal.votes_for,
            votes_against: proposal.votes_against,
        });

        Ok(())
    }
}

#[derive(Accounts)]
pub struct InitializeDao<'info> {
    #[account(
        init,
        payer = authority,
        space = 8 + Dao::INIT_SPACE,
        seeds = [b"dao"],
        bump
    )]
    pub dao: Account<'info, Dao>,
    #[account(mut)]
    pub authority: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct Propose<'info> {
    #[account(mut, seeds = [b"dao"], bump)]
    pub dao: Account<'info, Dao>,

    #[account(
        init,
        payer = proposer,
        space = 8 + Proposal::INIT_SPACE,
        seeds = [b"proposal", dao.proposal_count.to_le_bytes().as_ref()],
        bump
    )]
    pub proposal: Account<'info, Proposal>,

    #[account(mut)]
    pub proposer: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct Vote<'info> {
    #[account(mut)]
    pub proposal: Account<'info, Proposal>,

    #[account(
        init,
        payer = voter,
        space = 8 + VoteRecord::INIT_SPACE,
        seeds = [b"vote", proposal.key().as_ref(), voter.key().as_ref()],
        bump
    )]
    pub vote_record: Account<'info, VoteRecord>,

    #[account(mut)]
    pub voter: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct Enact<'info> {
    #[account(mut)]
    pub proposal: Account<'info, Proposal>,
}

#[account]
#[derive(InitSpace)]
pub struct Dao {
    pub authority: Pubkey,
    pub proposal_count: u64,
}

#[account]
#[derive(InitSpace)]
pub struct Proposal {
    pub id: u64,
    pub proposer: Pubkey,
    #[max_len(MAX_TEXT_LEN)]
    pub text: String,
    pub alignment_weight_snapshot: u64,
    pub votes_for: u64,
    pub votes_against: u64,
    pub created_at: i64,
    pub ends_at: i64,
    pub executed: bool,
    pub bump: u8,
}

#[account]
#[derive(InitSpace)]
pub struct VoteRecord {
    pub proposal: Pubkey,
    pub voter: Pubkey,
    pub weight: u64,
    pub vote_for: bool,
    pub bump: u8,
}

#[event]
pub struct ProposalCreated {
    pub id: u64,
    pub proposer: Pubkey,
    pub ends_at: i64,
}

#[event]
pub struct VoteCast {
    pub proposal: Pubkey,
    pub voter: Pubkey,
    pub vote_for: bool,
    pub weight: u64,
}

#[event]
pub struct ProposalEnacted {
    pub proposal: Pubkey,
    pub votes_for: u64,
    pub votes_against: u64,
}

#[error_code]
pub enum ErrorCode {
    #[msg("Proposal text too long")]
    TextTooLong,
    #[msg("Voting has already closed")]
    VotingClosed,
    #[msg("Voting is still open")]
    VotingStillOpen,
    #[msg("Proposal already executed")]
    AlreadyExecuted,
    #[msg("DAO threshold not met")]
    ThresholdNotMet,
    #[msg("Quorum not met")]
    QuorumNotMet,
    #[msg("Invalid vote/alignment weight")]
    InvalidWeight,
    #[msg("Math overflow")]
    MathOverflow,
}
