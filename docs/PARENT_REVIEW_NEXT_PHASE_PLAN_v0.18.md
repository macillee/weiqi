# PARENT_REVIEW_NEXT_PHASE_PLAN_v0.18

> Planning document covering goal/constraints, v0.17 assets, candidate integration directions, session boundary contract, and v0.18.0b acceptance criteria.

---

# Goal and Constraints

## Goal

Develop a parent review integration surface that preserves the existing v0.17 parent review debug surface while exploring safe, conservative approaches to providing insights to parents about their child's learning progress.

### Conservative Approach

1. **Preserve Existing Assets**: Build upon v0.17.0b debug surface without breaking changes
2. **Session Boundary First**: Focus on session summary and history modeling before parent UI
3. **Privacy-First**: Maintain strict data minimization and privacy boundaries
4. **Gradual Enhancement**: Defer parent-facing features until session boundaries are solid
5. **Backwards Compatible**: No impact on existing local anonymous mode

### v0.17 Assets to Build Upon

- `/dev/session-summary` - Parent session summary debug page
- `src/lib/session-summary-input.ts` - Input type for session summary
- `src/lib/session-summary.ts` - Session summary aggregation logic
- `ParentSessionSummary` - Structured output with category/level tables
- 12 new tests (545 total across 28 files)

## Candidate Integration Directions

### Priority 1: Session Boundary and History Modeling

1. **Session Boundary Contract** - Define session-to-session comparison protocol
2. **History Modeling** - Build algorithms for tracking learning progress over time
3. **Progress Signals** - Identify safe, aggregate signals for parent insight
4. **Temporal Analysis** - Analyze trends in correctness, difficulty, timing

### Priority 2: Safe Parent Access

5. **Guarded Parent Settings Entry** - Optional, auth-required parent access to insights
6. **End-of-Session Review Summary** - Lightweight summary shown at session completion
7. **Existing Page Extensions** - Enhanced parent insights within current UI pages
8. **Weekly/Monthly Summaries** - Periodic aggregated progress reports
9. **Developer Debug-Only Surface** - Continue using v0.17.0b debug surface for development

### Priority 3: Future Enhancements

10. **Full Parent Portal** - Comprehensive parent dashboard (deferred)
11. **Advanced Analytics** - Complex pattern analysis (deferred)
12. **AI-Enhanced Insights** - Machine learning for personalized recommendations (deferred)

## Session Boundary and History Modeling

### Data Flow

```
Child Practices → localStorage (Progress, Attempts)
                    ↓
Session Summary Aggregation → Progress Modeling
                    ↓
Session Boundary Contract → Safe Signals
                    ↓
Parent Insights (guarded access)
```

### Session Boundary Contract

- **Session Definition**: Complete learning sessions with clear start/end
- **Session Boundaries**: Clear separation between practice sessions
- **State Preservation**: Session state preserved across app restarts
- **Progress Tracking**: Cumulative progress across sessions

### History Modeling

- **Temporal Analysis**: Track performance over time
- **Progress Signals**: Safe, aggregate indicators of learning
- **Trend Detection**: Identify patterns in learning behavior
- **Benchmarking**: Compare current performance to historical data

### Privacy and Safety Design

1. **Data Minimization**: Only aggregate insights, no raw data
2. **Consent Requirements**: Optional parent access, auth-gated
3. **Guardrails**: Safe signal thresholds and validation
4. **Transparency**: Clear explanation of what signals mean

## Acceptance Criteria

### Functional Requirements

1. **Session Boundary Contract** - Well-defined session-to-session comparison protocol
2. **History Modeling** - Algorithms for tracking learning progress over time
3. **Safe Signals** - Aggregate indicators that provide useful parent insights
4. **Privacy Compliance** - No exposure of child's raw data or individual answers
5. **Backwards Compatibility** - No breaking changes to existing app functionality

### Quality Requirements

1. **Conservative Design** - Focus on boundaries before parent UI
2. **Privacy-First** - Data minimization and strict access controls
3. **Test Coverage** - Comprehensive testing of session boundary logic
4. **Performance** - Efficient algorithms that don't impact app speed
5. **Documentation** - Clear documentation of contracts and boundaries

### Non-Delivered in This Phase

- No parent-facing UI components
- No real-time parent notifications
- No AI-enhanced insights
- No advanced analytics
- No parental account management

## Deliverables

### Immediate (v0.18.0a)

1. **Session Boundary Contract** - Well-defined session structure and boundaries
2. **History Modeling** - Algorithms for tracking learning progress
3. **Safe Signals** - Aggregate indicators for parent insights
4. **Privacy Guidelines** - Guidelines for parent access and data use
5. **Testing** - Comprehensive test suite for session boundary logic

### Future (v0.18.0b+)

1. **Guarded Parent Settings** - Optional parent access interface
2. **End-of-Session Summary** - Lightweight progress summaries
3. **Enhanced Reporting** - Weekly/monthly parent summaries
4. **Parent Portal** - Comprehensive parent dashboard
5. **Analytics** - Advanced progress analysis

## Risks and Mitigation

### Risk: Too Conservative
- **Mitigation**: Clear definition of "safe enough" parent insights
- **Validation**: Parent testing with real users

### Risk: Session Boundary Complexity
- **Mitigation**: Start with simple, well-defined contracts
- **Validation**: Edge case testing for session boundaries

### Risk: Privacy Concerns
- **Mitigation**: Strict data minimization and access controls
- **Validation**: Privacy impact assessment with stakeholders

### Risk: Technical Debt
- **Mitigation**: Clean architecture with clear interfaces
- **Validation**: Code reviews and comprehensive testing

## Dependencies

### Required
- v0.17.0b Parent Review Debug Surface (existing)
- v0.17.0c QA validation report (existing)
- v0.16.0c Parent Session Summary Helper (existing)

### Optional
- v0.14.0c Local Engine Diagnostics (if needed for testing)
- v0.12.0d Local Rule-Assisted Review Coach (if integrated)

## References

- v0.17.0a: `docs/PARENT_REVIEW_INTEGRATION_PLAN_v0.17.md`
- v0.17.0b: `/dev/session-summary` prototype
- v0.17.0c: `docs/PARENT_REVIEW_DEBUG_QA_v0.17.md`
- v0.16.0c: `src/lib/session-summary-helper.ts`
- v0.17.0d: `docs/RELEASE_NOTES_v0.17.md`
