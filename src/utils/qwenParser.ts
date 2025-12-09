import type { TimelinePhase, ValidTimelineEvent, AgentRoleType, SquadSession } from '../types';

// Helper to determine role type
const getRoleType = (role: string): AgentRoleType => {
    const r = role.toLowerCase();
    if (r.includes('interpreter')) return 'interpreter';
    if (r.includes('visual director')) return 'visual';
    if (r.includes('concept architect')) return 'concept';
    if (r.includes('orchestrator')) return 'orchestrator';
    if (r.includes('critic')) return 'critic';
    if (r.includes('sdxl') || r.includes('system')) return 'system';
    return 'squad-member';
};

const parseContent = (content: string) => {
    try {
        if (typeof content === 'string' && (content.trim().startsWith('{') || content.trim().startsWith('```json'))) {
            const match = content.match(/```json([\s\S]*?)```/) || [null, content];
            return JSON.parse(match[1] || content);
        }
    } catch (e) { /* ignore */ }
    return content;
};

export const parseQwenData = (data: any, source: string): TimelinePhase[] => {
    const phases: TimelinePhase[] = [];
    const history = data.final_state?.history || data.history || [];

    // Helper for image paths
    const resolveImagePath = (path: string) => {
        if (source === 'qwen' && !path.startsWith('output_qwen/')) {
            return `output_qwen/${path}`;
        }
        // ChatGPT paths usually already include output_chatgpt/
        return path;
    };

    // --- PHASE 0: SETUP ---
    const setupEvents: ValidTimelineEvent[] = [];
    let textIndex = 0;

    const directorRoles = ['music interpreter', 'visual director', 'concept architect', 'orchestrator', 'squad selector'];

    // Collect setup events until the first "Squad Prompt" or actual round activity
    // Qwen logs often have Orchestrator/Squad Selector setting things up.
    while (textIndex < history.length) {
        const item = history[textIndex];
        const roleLower = item.role.toLowerCase();

        // Check for round start indicators
        if (roleLower.includes('squad prompt') || roleLower === 'sdxl') {
            break;
        }

        // Also check if a squad member starts talking (not a director)
        // Squad members usually have specific names, while directors are fixed roles.
        // We verify if it IS a director role.
        const isDirector = directorRoles.some(dr => roleLower.includes(dr));

        // Special case: "The Post-Humanist" etc are squad members.
        if (!isDirector) {
            // Found a squad member speaking -> start of rounds
            break;
        }

        setupEvents.push({
            id: `setup-${textIndex}`,
            type: 'info',
            agent: item.role,
            roleType: getRoleType(item.role),
            title: item.role,
            content: parseContent(item.content)
        });
        textIndex++;
    }

    phases.push({
        id: 'phase-0',
        title: 'Phase 0: Director\'s Vision',
        type: 'setup',
        setupEvents
    });

    // --- ROUNDS ---
    let roundCount = 1;
    // Track active squads. Initially all 3 are active.
    // We identify them by their ID: 'harmonic', 'conflict', 'random'
    const activeSquadIds = new Set(['harmonic', 'conflict', 'random']);

    while (textIndex < history.length && activeSquadIds.size > 0) {
        const currentRoundIndex = roundCount++;

        // Containers for this round's events per squad
        const squadEventsMap: Record<string, ValidTimelineEvent[]> = {
            harmonic: [],
            conflict: [],
            random: []
        };

        let roundImages: string[] = [];

        // 1. DISCUSSION PHASE (Until SDXL generation)
        let currentBuffer: ValidTimelineEvent[] = [];

        while (textIndex < history.length) {
            const item = history[textIndex];
            const roleLower = item.role.toLowerCase();

            if (roleLower === 'sdxl') {
                try {
                    const imgs = JSON.parse(item.content);
                    if (Array.isArray(imgs)) {
                        roundImages = imgs.map((img: string) => resolveImagePath(img));
                    }
                } catch(e) {}
                textIndex++;
                break; // End of discussion/generation block
            }

            const event: ValidTimelineEvent = {
                id: `round-${currentRoundIndex}-${textIndex}`,
                type: roleLower.includes('prompt') ? 'prompt' : 'dialogue',
                agent: item.role,
                roleType: getRoleType(item.role),
                title: item.role,
                content: parseContent(item.content)
            };

            currentBuffer.push(event);

            // FLUSH BUFFER mechanisms
            // In Qwen logs, "Harmonic Squad Prompt" usually *follows* the discussion of that squad?
            // OR precedes the designated slot?
            // Looking at the log:
            // ... Squad Member discussion ...
            // then "Harmonic Squad Prompt" (containing the summarized prompt)

            if (roleLower.includes('harmonic squad prompt')) {
                squadEventsMap['harmonic'].push(...currentBuffer);
                currentBuffer = [];
            } else if (roleLower.includes('conflict squad prompt')) {
                squadEventsMap['conflict'].push(...currentBuffer);
                currentBuffer = [];
            } else if (roleLower.includes('random squad prompt')) {
                squadEventsMap['random'].push(...currentBuffer);
                currentBuffer = [];
            }
            // Support generic "Squad Prompt" if specific names aren't used (fallback)
            else if (roleLower === 'squad prompt' && currentBuffer.length > 0) {
                // Heuristic: try to guess which squad based on content or order?
                // For now, assume strict naming in Qwen logs as seen in sample.
            }

            textIndex++;
        }

        // 2. CRITIQUE PHASE
        // Collect critiques and assign to correct squad
        // Also check scores for termination
        const squadCritiquesMap: Record<string, ValidTimelineEvent[]> = {
            harmonic: [],
            conflict: [],
            random: []
        };

        // We need to know which critique belongs to which squad.
        // The log order is usually Harmonic blocks -> Conflict blocks -> Random blocks?
        // OR it's interleaved?
        // Sample log shows:
        // SDXL generation
        // Music Interpreter -> Visual Director -> ... -> Orchestrator (Final decision for Squad A?)
        // OR does Orchestrator give distinct feedback per squad?

        // Sample log (lines 489+):
        // Music Interpreter -> ... -> Orchestrator (refinement_instruction)
        // THEN Music Interpreter -> ... -> Orchestrator
        // It seems to be 3 blocks of critiques.
        // We can assume the order matches the squads: Harmonic, Conflict, Random.

        const squadsToProcess = ['harmonic', 'conflict', 'random'] as const; // Fixed order of processing

        for (const squadId of squadsToProcess) {
            // If this squad was already terminated in a previous round, it might not have critiques?
            // BUT wait, the loop structure in the simulation would probably skip it entirely.
            // So we should only look for critiques if we expect them?
            // Actually, let's just consume blocks.

            // However, if a squad is "done", it won't appear in the logs.
            // We need to match the *active* squads to the critique blocks found.
            // But strict matching is hard without explicit "Critique for Harmonic" labels.
            // Orchestrator's `squad_selection_instructions` doesn't help here.

            // Let's assume the order in logs corresponds to the active squads.
            // But we need to be robust.

            // Actually, let's just collect ALL critique events until the next "Squad Prompt" or End of Log,
            // then divide them into blocks.

            // A "block" ends when Orchestrator gives a status or score?
            // In log: Orchestrator -> `refinement_instruction`.

            if (!activeSquadIds.has(squadId)) continue;

            const currentBlock: ValidTimelineEvent[] = [];

            while (textIndex < history.length) {
                const item = history[textIndex];
                const roleLower = item.role.toLowerCase();

                // Stop if we hit a new round start (e.g. Squad Member speaking)
                // Director roles are: Music Interpreter, Visual Director, Concept Architect, Orchestrator
                // Squad members are NOT these.
                if (!directorRoles.some(dr => roleLower.includes(dr)) && !roleLower.includes('orchestrator')) {
                    // Squad member speaking -> Next round started!
                    break;
                }

                // Stop if we hit "Harmonic Squad Prompt" etc (shouldn't happen in critique phase)

                const contentObj = parseContent(item.content);
                let scores: Record<string, any> | undefined;
                if (contentObj && typeof contentObj === 'object') {
                    if (contentObj.scores) scores = contentObj.scores;
                    else if (contentObj.ci_score) scores = { "CI Score": contentObj.ci_score };
                }

                currentBlock.push({
                    id: `round-${currentRoundIndex}-crit-${textIndex}`,
                    type: 'critique',
                    agent: item.role,
                    roleType: 'critic',
                    title: item.role + ' (Critic)',
                    content: contentObj,
                    scores: scores
                });

                textIndex++;

                if (roleLower.includes('orchestrator')) {
                    // Check if this is the end of a critique block
                    // Orchestrator usually gives the final word per squad.
                    // We consume one block per active squad.

                    // Logic for termination
                    // Check CI Score or Status
                    const ciScore = contentObj?.ci_score;
                    if (typeof ciScore === 'number' && ciScore >= 3.99) { // Using 3.99 to be safe for 4.0 float
                        activeSquadIds.delete(squadId); // Terminate!
                    }

                    break; // End of this squad's critique block
                }
            }

            squadCritiquesMap[squadId] = currentBlock;
        }

        // Assemble Squads for this phase
        const squads: SquadSession[] = [];

        // Qwen logs: Images seem to correspond to [Harmonic, Conflict, Random] output indices usually.
        // We need to map them carefully.
        // Assuming roundImages[0] -> 1st active squad? Or always strict index?
        // Usually Multi-Agent systems maintain slots.
        // Let's assume strict slots: 0->Harmonic, 1->Conflict, 2->Random
        // UNLESS the prompt/generation call only requested specific ones.
        // But the log shows `["path1", "path2", "path3"]`.

        // Use a safe index lookup
        const orderedIds = ['harmonic', 'conflict', 'random'] as const;

        orderedIds.forEach((sid, idx) => {
            // Only add if it has events OR was active
            // Actually, if it was terminated, we shouldn't show it as "active" in this round?
            // "remaining squads only perform next iteration".
            // So if `events` are empty, we skip.

            const events = squadEventsMap[sid];
            const critiques = squadCritiquesMap[sid];

            // Only add if it has events OR has critiques (meaning it was active this round)
            if (events.length > 0 || critiques.length > 0) {
                 squads.push({
                    id: `sq-${sid}-${currentRoundIndex}`,
                    name: `${sid.charAt(0).toUpperCase() + sid.slice(1)} Squad`,
                    squadId: sid,
                    events,
                    critiques,
                    generatedImage: roundImages[idx] // Using strict index might be risky if count < 3.
                                                   // But `roundImages` comes from SDXL output which usually outputs N images.
                 });
            }
        });

        if (squads.length > 0) {
            phases.push({
                id: `round-${currentRoundIndex}`,
                title: `Round ${currentRoundIndex}`,
                type: 'round',
                roundIndex: currentRoundIndex,
                squads
            });
        } else {
            break; // No activity
        }
    }

    // --- FINAL PHASE ---
    if (data.final_images && data.final_images.length > 0) {
        phases.push({
            id: 'phase-final',
            title: 'Final Result',
            type: 'final',
            finalEvents: [
                {
                    id: 'final-images',
                    type: 'image',
                    agent: 'System',
                    roleType: 'system',
                    title: 'Final High-Res Output',
                    content: 'Consensus reached. Generating final output.',
                    images: (() => {
                        let allImages = data.final_images || [];

                        // For Qwen, if specific squad images are missing from the JSON list,
                        // manually inject them as they likely exist in the folder (as verified).
                        if (source === 'qwen' && data.run_dir) {
                             const squadImages = [
                                `${data.run_dir}/squad_harmonic.png`,
                                `${data.run_dir}/squad_conflict.png`,
                                `${data.run_dir}/squad_random.png`
                             ];
                             // Add them if not already present (checking partially)
                             squadImages.forEach(sImg => {
                                 if (!allImages.some((existing: string) => existing.includes(sImg.split('/').pop()!))) {
                                     allImages.unshift(sImg);
                                 }
                             });
                        }

                        const filtered = allImages.filter((img: string) => {
                            const lower = img.toLowerCase();
                            return lower.includes('squad_harmonic.png') ||
                                   lower.includes('squad_random.png') ||
                                   lower.includes('squad_conflict.png');
                        });

                        // If we have our target squad images, show them. Otherwise fallback to everything.
                        return (filtered.length > 0 ? filtered : allImages).map((img: string) => resolveImagePath(img));
                    })()
                }
            ]
        });
    }

    return phases;
};
